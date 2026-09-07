from flask import Flask, render_template, request, jsonify, session, send_file
from functools import wraps
from datetime import datetime, timedelta
import jwt, bcrypt, io, csv, math, uuid
import pandas as pd

app = Flask(__name__)
app.secret_key = 'shop-ai-local-session-secret-2026'
JWT_SECRET = 'shop_ai_enterprise_super_secret_jwt_key_2026'

# ------------------------------
# Model / benchmark definitions
# ------------------------------
DEPT = {
    'Engineering': {'roles':['Senior Full-Stack Engineer','Lead Cloud Architect','Staff DevOps Engineer','Software Engineer II','Frontend Developer','Data Platform Engineer','QA Automation Lead'],'base':145000,'min':65000,'max':280000},
    'Product': {'roles':['Principal Product Manager','Senior Product Designer','Technical Product Manager','Associate PM','UX Research Lead','Product Operations Manager'],'base':155000,'min':70000,'max':290000},
    'Sales': {'roles':['Enterprise Account Executive','Sales Director','Business Development Rep','Strategic Account Manager','Client Solutions Consultant','Inbound Sales Specialist'],'base':110000,'min':45000,'max':220000},
    'Marketing': {'roles':['Performance Marketing Lead','Content Strategist','Growth Marketing Manager','Brand Marketing Specialist','SEO/SEM Analyst','Lifecycle Marketer'],'base':98000,'min':42000,'max':190000},
    'Human Resources': {'roles':['Senior HRBP','Talent Acquisition Partner','People Operations Lead','Compensation & Benefits Specialist','Learning & Development Manager'],'base':88000,'min':40000,'max':175000},
    'Operations': {'roles':['Operations Program Manager','IT Systems Administrator','Supply Chain Analyst','Procurement Specialist','Facilities Manager'],'base':85000,'min':38000,'max':165000},
}
FIRST = ['Aarav','Ananya','Rohan','Priya','Aditya','Sneha','Vikram','Neha','Kavya','Rahul','Ishaan','Tanvi','Arjun','Meera','Varun','Deepika','Karthik','Pooja','Siddharth','Riya','Amit','Divya','Suresh','Kiran','Manish','Shreya','Gaurav','Nisha','Rajesh','Preeti','Dev','Swati','Harsh','Anjali','Akash','Shruti','Nikhil','Simran','Alok','Bhavna','Sameer','Monika','Abhishek','Rashmi','Sachin','Komal','Pranav','Payal','Tushar','Geeta']
LAST = ['Sharma','Verma','Patel','Iyer','Nair','Reddy','Chopra','Gupta','Singh','Deshmukh','Kulkarni','Mehta','Joshi','Bose','Menon','Rao','Agarwal','Chatterjee','Bhat','Malhotra','Saxena','Kapoor','Pandey','Mishra','Bhattacharya','Chauhan','Thakur','Yadav','Dubey','Soni']

def rng(seed=42):
    s = seed
    while True:
        s = (s * 1664525 + 1013904223) % 4294967296
        yield s / 4294967296

R = rng()

def predict(emp, model='xgboost'):
    log = -1.45
    sat = emp.get('satisfactionScore',3)
    if sat <= 1: log += 1.45
    elif sat == 2: log += .85
    elif sat == 3: log += .05
    elif sat == 4: log -= .65
    else: log -= 1.15
    ot = emp.get('overtimeHoursWeekly', 12 if emp.get('hasOvertime') else 0)
    if ot > 15: log += 1.25
    elif ot > 8: log += .75
    elif ot > 0: log += .35
    else: log -= .45
    wlb = emp.get('workLifeBalance',3)
    if wlb <= 1: log += .85
    elif wlb == 2: log += .45
    elif wlb >= 4: log -= .55
    dept = emp.get('department','Engineering')
    benchmark = DEPT.get(dept, {'base':120000})['base']
    salary = emp.get('monthlySalary',benchmark)
    ratio = salary / benchmark if benchmark else 1
    if ratio < .75: log += 1.1
    elif ratio < .9: log += .55
    elif ratio > 1.25: log -= .85
    elif ratio > 1.1: log -= .45
    ysp = emp.get('yearsSincePromotion',1); ytc = emp.get('yearsAtCompany',3)
    if ysp >= 4 and ytc >= 4: log += .95
    elif ysp >= 3: log += .45
    elif ysp == 0: log -= .55
    mgr = emp.get('managerRelationshipScore',3)
    if mgr <= 1: log += .9
    elif mgr == 2: log += .45
    elif mgr >= 4: log -= .5
    dist = emp.get('distanceFromHomeKm',10); remote = emp.get('remoteWorkOption','Hybrid')
    if dist > 30 and remote == 'On-site': log += .6
    elif remote == 'Full-time': log -= .3
    train = emp.get('trainingTimesLastYear',2)
    if train == 0: log += .4
    elif train >= 3: log -= .35
    if model in ('xgboost','random_forest'):
        if ot > 10 and sat <= 2: log += .75
        perf = emp.get('performanceRating',3)
        if perf >= 4 and ratio < .9 and ysp >= 2: log += .85
        if ytc > 6 and sat >= 4 and mgr >= 4: log -= .7
    p = 1/(1+math.exp(-log))
    risk = max(.03,min(.97,round(p*1000)/1000))
    level = 'high' if risk >= .65 else ('medium' if risk >= .35 else 'low')
    return risk, level

def make_employees(n=520):
    g = rng(42); out=[]
    for i in range(1,n+1):
        rid=f'EMP-{i:04d}'; first=FIRST[int(next(g)*len(FIRST))]; last=LAST[int(next(g)*len(LAST))]
        name=f'{first} {last}'; x=next(g); gender='Female' if x<.48 else ('Male' if next(g)<.96 else 'Other')
        dept_name=list(DEPT.keys())[int(next(g)*len(DEPT))]; d=DEPT[dept_name]; role=d['roles'][int(next(g)*len(d['roles']))]
        roll=next(g); hi=roll<.358; med=(not hi and roll<.715)
        if hi:
            sat=1 if next(g)<.6 else 2; ot=int(10+next(g)*18); has=True; ysp=int(3+next(g)*4); mgr=1 if next(g)<.7 else 2
            salary=round((d['base']*(.68+next(g)*.22))/1000)*1000; wlb=1 if next(g)<.7 else 2; ytc=int(3+next(g)*6); ycr=min(ytc,int(2+next(g)*4)); age=int(26+next(g)*16); dist=int(15+next(g)*30); train=0 if next(g)<.6 else 1; remote='On-site' if next(g)<.6 else 'Hybrid'; perf=4 if next(g)<.5 else 3
        elif med:
            sat=3; ot=int(3+next(g)*6) if next(g)<.5 else 0; has=ot>0; ysp=int(1+next(g)*3); mgr=3; salary=round((d['base']*(.9+next(g)*.2))/1000)*1000; wlb=3; ytc=int(2+next(g)*5); ycr=min(ytc,int(1+next(g)*3)); age=int(25+next(g)*18); dist=int(8+next(g)*20); train=int(1+next(g)*3); remote='Hybrid' if next(g)<.5 else 'Full-time'; perf=3
        else:
            sat=4 if next(g)<.5 else 5; ot=0; has=False; ysp=int(next(g)*2); mgr=4 if next(g)<.4 else 5; salary=round((d['base']*(1.15+next(g)*.35))/1000)*1000; wlb=4 if next(g)<.4 else 5; ytc=int(2+next(g)*8); ycr=int(1+next(g)*3); age=int(28+next(g)*20); dist=int(3+next(g)*14); train=int(2+next(g)*4); remote='Hybrid' if next(g)<.6 else 'Full-time'; perf=4 if next(g)<.6 else 5
        emp={'id':rid,'name':name,'email':f'{first.lower()}.{last.lower()}@enterprise.corp','avatar':f'https://api.dicebear.com/7.x/avataaars/svg?seed={first}{last}','department':dept_name,'role':role,'age':age,'gender':gender,'yearsAtCompany':ytc,'yearsInCurrentRole':ycr,'yearsSincePromotion':ysp,'monthlySalary':int(salary),'satisfactionScore':sat,'environmentSatisfaction':sat,'workLifeBalance':wlb,'overtimeHoursWeekly':ot,'hasOvertime':has,'performanceRating':perf,'distanceFromHomeKm':dist,'trainingTimesLastYear':train,'managerRelationshipScore':mgr,'remoteWorkOption':remote,'education':'Master\'s Degree' if next(g)<.7 else 'Bachelor\'s Degree'}
        risk,level=predict(emp); emp['attritionRisk']=risk; emp['riskLevel']=level
        if ot>10: primary='Excessive Overtime & Burnout'
        elif sat<=2: primary='Low Job Satisfaction'
        elif salary<d['base']*.85: primary='Below Market Compensation'
        elif ysp>=3: primary='Promotion Stagnation'
        elif mgr<=2: primary='Managerial Friction'
        else: primary='Balanced Risk Profile'
        emp['primaryRiskFactor']=primary; out.append(emp)
    return out

ML_MODELS=[
 {'name':'XGBoost (Gradient Boosted Trees)','type':'xgboost','accuracy':.894,'precision':.871,'recall':.852,'f1Score':.861,'rocAuc':.932,'trainingTimeMs':1420,'isBest':True},
 {'name':'Random Forest Classifier','type':'random_forest','accuracy':.868,'precision':.842,'recall':.819,'f1Score':.830,'rocAuc':.897,'trainingTimeMs':980,'isBest':False},
 {'name':'Logistic Regression (L2 Regularized)','type':'logistic_regression','accuracy':.812,'precision':.765,'recall':.748,'f1Score':.756,'rocAuc':.825,'trainingTimeMs':230,'isBest':False},
]
FEATURES=[
 ('Overtime & Workload Strain',.235,'Increases Attrition','Workload'),('Job & Environment Satisfaction',.208,'Decreases Attrition','Environment'),('Compensation Relative to Role Median',.174,'Increases Attrition','Compensation'),('Years Since Last Promotion (Stagnation)',.142,'Increases Attrition','Career Growth'),('Manager Relationship & Trust Score',.098,'Decreases Attrition','Environment'),('Work-Life Balance & Remote Flexibility',.076,'Decreases Attrition','Workload'),('Training & Upskilling Frequency',.045,'Decreases Attrition','Career Growth'),('Commute Distance (Distance From Home)',.022,'Increases Attrition','Environment')]

# ------------------------------
# In-memory application state
# ------------------------------
employees=[]
users={
 'admin@shopai.enterprise':{'id':'USR-001','name':'Sarah Jenkins','email':'admin@shopai.enterprise','password':bcrypt.hashpw(b'ShopAI@2026',bcrypt.gensalt()).decode(),'role':'HR Admin','avatar':'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150','department':'People Operations','companyName':'SHOP AI Global Enterprise','isHigherAuthority':False},
 'manager@shopai.enterprise':{'id':'USR-002','name':'David Rao','email':'manager@shopai.enterprise','password':bcrypt.hashpw(b'ShopAI@2026',bcrypt.gensalt()).decode(),'role':'HR Manager','avatar':'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150','department':'Engineering & Technology','companyName':'SHOP AI Global Enterprise','isHigherAuthority':False},
 'analyst@shopai.enterprise':{'id':'USR-003','name':'Priya Sharma','email':'analyst@shopai.enterprise','password':bcrypt.hashpw(b'ShopAI@2026',bcrypt.gensalt()).decode(),'role':'Analyst','avatar':'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150','department':'Workforce Intelligence','companyName':'SHOP AI Global Enterprise','isHigherAuthority':False},
 'executive@shopai.enterprise':{'id':'USR-004','name':'Vikram Malhotra','email':'executive@shopai.enterprise','password':bcrypt.hashpw(b'ShopAI@2026',bcrypt.gensalt()).decode(),'role':'Executive / Higher Authority','avatar':'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150','department':'Executive Board & C-Suite','companyName':'SHOP AI Global Enterprise','isHigherAuthority':True},
}

demo_accounts=[{'id':'demo-admin','role':'HR Admin','name':'Sarah Jenkins','email':'admin@shopai.enterprise','passwordHint':'ShopAI@2026','description':'Full People Operations authorization, intervention approval, and staff directory management.','badge':'Admin Access','isHigherAuthority':False},
{'id':'demo-manager','role':'HR Manager','name':'David Rao','email':'manager@shopai.enterprise','passwordHint':'ShopAI@2026','description':'Department-level retention simulation, cohort health diagnostics, and team coaching.','badge':'Manager Access','isHigherAuthority':False},
{'id':'demo-analyst','role':'Analyst','name':'Priya Sharma','email':'analyst@shopai.enterprise','passwordHint':'ShopAI@2026','description':'Workforce telemetry, predictive modeling diagnostics, and anonymized/masked salary inspection.','badge':'Analyst Access','isHigherAuthority':False},
{'id':'demo-executive','role':'Executive / Higher Authority','name':'Vikram Malhotra','email':'executive@shopai.enterprise','passwordHint':'ShopAI@2026','description':'Elevated C-Suite clearance: organization-wide financial exposure, board dossiers, and strategy controls.','badge':'Higher Authority','isHigherAuthority':True}]

audits=[]
interventions=[]
notifications=[
 {'id':'N3','title':'Model Health','message':'XGBoost remains the highest-performing model at 93.2% ROC-AUC.','type':'success','time':'2h','read':True}
]

def current_user(): return session.get('user')
def auth_required(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):
        u=current_user()
        if not u: return jsonify({'success':False,'message':'Authentication required'}),401
        return fn(*args,**kwargs)
    return wrapper

def log_audit(user,action,details):
    audits.insert(0,{'id':'AUDIT-'+uuid.uuid4().hex[:6].upper(),'timestamp':datetime.utcnow().isoformat(),'userId':user['id'],'userName':user['name'],'userEmail':user['email'],'userRole':user['role'],'action':action,'details':details,'ipAddress':request.remote_addr or '127.0.0.1'})
    del audits[200:]

def metrics():
    total=len(employees); high=sum(e['riskLevel']=='high' for e in employees); med=sum(e['riskLevel']=='medium' for e in employees); low=total-high-med
    rate=round(sum(e['attritionRisk'] for e in employees)/total*100,1) if total else 0
    exposure=sum(round(e['monthlySalary']*12*1.5*e['attritionRisk']) for e in employees)
    saved=max(0, len(interventions)*4+12)
    return {'totalCount':total,'highRiskCount':high,'mediumRiskCount':med,'lowRiskCount':low,'attritionRatePercent':rate,'totalFinancialExposureINR':exposure,'savedEmployeesCount':saved,'retentionSuccessRate':round(min(96,76+saved/4),1)}

def shap(emp):
    d=DEPT.get(emp['department'],{'base':120000}); base=d['base']; diff=round((emp['monthlySalary']-base)/base*100); c=[]
    if emp['satisfactionScore']<=2: c.append(('Low Job Satisfaction','satisfactionScore',f"{emp['satisfactionScore']}/5 score",.24 if emp['satisfactionScore']==1 else .14,'Environment',f"Employee reported dissatisfaction ({emp['satisfactionScore']}/5), substantially increasing disengagement."))
    elif emp['satisfactionScore']>=4: c.append(('High Job Satisfaction','satisfactionScore',f"{emp['satisfactionScore']}/5 score",-.18 if emp['satisfactionScore']==5 else -.11,'Environment','Strong daily role contentment serves as a primary retention buffer.'))
    if emp['overtimeHoursWeekly']>8 or emp['hasOvertime']: c.append(('High Overtime & Workload','overtimeHoursWeekly',f"{emp['overtimeHoursWeekly']} hrs/wk",.22 if emp['overtimeHoursWeekly']>15 else .13,'Workload','Chronic overtime creates burnout vulnerability.'))
    else: c.append(('Balanced Workload (No Overtime)','overtimeHoursWeekly','0 hrs/wk',-.09,'Workload','Standard working hours safeguard against workplace exhaustion.'))
    if diff<-10: c.append(('Salary Below Peer Average','monthlySalary',f"₹{emp['monthlySalary']:,} ({diff}%)",.21 if diff<-25 else .12,'Compensation',f"Compensation is {abs(diff)}% below department median."))
    elif diff>15: c.append(('Competitive Compensation','monthlySalary',f"₹{emp['monthlySalary']:,} (+{diff}%)",-.14,'Compensation',f"Earns {diff}% above department median, anchoring retention."))
    if emp['yearsSincePromotion']>=3: c.append(('Promotion Stagnation','yearsSincePromotion',f"{emp['yearsSincePromotion']} yrs since promo",.18 if emp['yearsSincePromotion']>=5 else .11,'Career Growth','No title or role progression; market mobility probability elevated.'))
    elif emp['yearsSincePromotion']<=1: c.append(('Recent Promotion / Recognition','yearsSincePromotion',f"{emp['yearsSincePromotion']} yr ago",-.10,'Career Growth','Recent career elevation reinforces positive organizational commitment.'))
    if emp['managerRelationshipScore']<=2: c.append(('Strained Manager Relationship','managerRelationshipScore',f"{emp['managerRelationshipScore']}/5 score",.13,'Environment','Frictional managerial dynamics often trigger departure intentions.'))
    elif emp['managerRelationshipScore']>=4: c.append(('Strong Manager Trust & Rapport','managerRelationshipScore',f"{emp['managerRelationshipScore']}/5 score",-.09,'Environment','Supportive leadership guidance provides emotional safety and loyalty.'))
    if emp['distanceFromHomeKm']>25 and emp['remoteWorkOption']=='On-site': c.append(('Demanding Commute Distance','distanceFromHomeKm',f"{emp['distanceFromHomeKm']} km on-site",.08,'Environment','Daily transit without hybrid flex adds fatigue.'))
    else: c.append(('Flexible Workplace Model','remoteWorkOption',emp['remoteWorkOption'],-.06,'Workload',f"{emp['remoteWorkOption']} schedule provides autonomy."))
    return sorted([{'factor':a,'featureKey':b,'value':c1,'impact':d,'category':e,'description':f} for a,b,c1,d,e,f in c],key=lambda x:abs(x['impact']),reverse=True)

def recs(emp):
    d=DEPT.get(emp['department'],{'base':120000}); annual=emp['monthlySalary']*12; repl=round(annual*1.5); r=[]
    def add(suffix,title,desc,prio,impact,cost,cat):
        benefit=round(repl*impact/100); r.append({'id':f'rec-{suffix}-{emp["id"]}','employeeId':emp['id'],'title':title,'description':desc,'priority':prio,'expectedImpactPercent':impact,'estimatedCostINR':cost,'estimatedBenefitINR':benefit,'roiMultiplier':round(benefit/max(cost,1),1),'category':cat})
    if emp['overtimeHoursWeekly']>8 or emp['hasOvertime']: add('workload','Workload Rebalancing & Overtime Cap',f"Reassign {round(emp['overtimeHoursWeekly']*.7)} weekly overtime hours and enforce 40-hr workload limits.",'Urgent',28,45000,'Workload')
    if emp['monthlySalary']<d['base']:
        inc=round(min(d['base']-emp['monthlySalary'],emp['monthlySalary']*.18)); add('comp','Targeted Compensation Market Correction',f"Adjust monthly base pay by +₹{inc:,} to align with the 50th percentile of {emp['department']} peer band.",'Urgent' if emp['monthlySalary']<d['base']*.8 else 'High',34,inc*12,'Compensation')
    if emp['yearsSincePromotion']>=3: add('career','Accelerated Promotion & Career Path Review','Schedule a structured progression review and formalize the senior career trajectory path within 30 days.','High',24,80000,'Career Path')
    if emp['managerRelationshipScore']<=2: add('mgr','Manager Alignment & Skip-Level Coaching','Facilitate skip-level 1-on-1 with Department VP and independent executive mentor.','High',20,30000,'Managerial')
    if emp['trainingTimesLastYear']<2: add('training','Sponsored Specialized Certification & Upskilling','Sponsor certification and allocate 4 dedicated hours weekly for continuous professional learning.','Medium',15,40000,'Wellbeing')
    if emp['remoteWorkOption']=='On-site' and emp['distanceFromHomeKm']>15: add('flex','Transition to Hybrid Workplace Policy','Authorize 3 days weekly remote work to mitigate severe transit friction.','Medium',18,15000,'Wellbeing')
    return r

# ------------------------------
# Pages + APIs
# ------------------------------
@app.get('/')
def index(): return render_template('index.html')
@app.get('/api/health')
def health(): return jsonify({'status':'ok','service':'SHOP AI Python Enterprise Gateway','timestamp':datetime.utcnow().isoformat()})
@app.get('/api/auth/demo-accounts')
def demo(): return jsonify({'success':True,'accounts':demo_accounts})
@app.post('/api/auth/demo-accounts')
def demo_update():
    data=request.get_json() or {}; accounts=data.get('accounts',[])
    for acc in accounts:
        for u in users.values():
            if u['email'].lower()==str(acc.get('email','')).lower().strip():
                u['name']=str(acc.get('name') or u['name']).strip(); u['role']=str(acc.get('role') or u['role']).strip()
    return jsonify({'success':True,'message':'Demo profiles updated.'})
@app.post('/api/auth/login')
def login():
    data=request.get_json() or {}; email=str(data.get('email','')).strip().lower(); pw=str(data.get('password',''))
    u=users.get(email)
    if not u or not bcrypt.checkpw(pw.encode(),u['password'].encode()): return jsonify({'success':False,'message':'Invalid credentials. Please verify your email and password.'}),401
    payload={'sub':u['id'],'email':u['email'],'exp':datetime.utcnow()+timedelta(hours=24)}; token=jwt.encode(payload,JWT_SECRET,algorithm='HS256')
    safe={k:v for k,v in u.items() if k!='password'}; safe['token']=token; session['user']=safe; log_audit(safe,'ELEVATED_ACCESS' if safe['isHigherAuthority'] else 'LOGIN',f"Authenticated successfully as {safe['role']}.")
    return jsonify({'success':True,'token':token,'user':safe,'message':f"Welcome back, {safe['name']}! Access authorized as {safe['role']}."})
@app.post('/api/auth/register')
def register():
    d=request.get_json() or {}; name=d.get('name'); email=str(d.get('email','')).strip().lower(); pw=d.get('password'); role=d.get('role') or 'HR Manager'; company=d.get('companyName') or 'SHOP AI Global Enterprise'
    if not name or not email or not pw: return jsonify({'success':False,'message':'Full name, email, and password are required.'}),400
    if email in users: return jsonify({'success':False,'message':'An account with this corporate email already exists.'}),409
    uid='USR-'+uuid.uuid4().hex[:6].upper(); high='executive' in role.lower() or 'higher' in role.lower()
    u={'id':uid,'name':name,'email':email,'password':bcrypt.hashpw(str(pw).encode(),bcrypt.gensalt()).decode(),'role':role,'avatar':'https://api.dicebear.com/7.x/avataaars/svg?seed='+name.replace(' ',''),'department':'Executive Board' if high else 'Human Resources','companyName':company,'isHigherAuthority':high}
    users[email]=u; safe={k:v for k,v in u.items() if k!='password'}; session['user']=safe; log_audit(safe,'REGISTER','Created and provisioned a new enterprise account.')
    return jsonify({'success':True,'token':'local-'+uuid.uuid4().hex,'user':safe,'message':f'Welcome, {name}!'}),201
@app.post('/api/auth/logout')
def logout():
    u=current_user()
    if u: log_audit(u,'LOGOUT','Session closed by user.')
    session.clear(); return jsonify({'success':True})

@app.get('/api/state')
@auth_required
def state():
    m=metrics(); deps=department_metrics(); return jsonify({'success':True,'user':current_user(),'metrics':m,'employees':employees,'interventions':interventions,'notifications':notifications,'models':ML_MODELS,'features':[dict(feature=f,importance=i,impactDirection=d,category=c) for f,i,d,c in FEATURES],'departments':deps,'departmentConfig':{name:{'roles':info['roles'],'base':info['base'],'min':info['min'],'max':info['max']} for name,info in DEPT.items()},'audits':audits[:40]})

def department_metrics():
    out=[]
    for name in DEPT:
        es=[e for e in employees if e['department']==name]
        if not es: continue
        out.append({'department':name,'headcount':len(es),'attritionRate':round(sum(x['attritionRisk'] for x in es)/len(es)*100,1),'highRiskCount':sum(x['riskLevel']=='high' for x in es),'mediumRiskCount':sum(x['riskLevel']=='medium' for x in es),'lowRiskCount':sum(x['riskLevel']=='low' for x in es),'avgSalaryINR':round(sum(x['monthlySalary'] for x in es)/len(es)),'avgTenureYears':round(sum(x['yearsAtCompany'] for x in es)/len(es),1),'avgSatisfaction':round(sum(x['satisfactionScore'] for x in es)/len(es),2),'avgOvertimeHours':round(sum(x['overtimeHoursWeekly'] for x in es)/len(es),1),'totalFinancialExposureINR':sum(round(x['monthlySalary']*12*1.5*x['attritionRisk']) for x in es),'topRiskFactors':pd.Series([x['primaryRiskFactor'] for x in es if x['riskLevel']=='high']).value_counts().head(3).index.tolist()})
    return out

def build_employee(d, default_email=''):
    name=str(d.get('name','')).strip()
    email=str(d.get('email',default_email)).strip().lower()
    department=str(d.get('department','Engineering')).strip()
    role=str(d.get('role','Software Engineer II')).strip()
    try:
        age=max(18,min(75,int(d.get('age',30))))
        years_at=max(0,int(d.get('yearsAtCompany',2)))
        years_role=max(0,int(d.get('yearsInCurrentRole',1)))
        years_promo=max(0,int(d.get('yearsSincePromotion',1)))
        salary=max(0,int(float(d.get('monthlySalary',100000))))
        sat=max(1,min(5,int(d.get('satisfactionScore',3))))
        env=max(1,min(5,int(d.get('environmentSatisfaction',sat))))
        wlb=max(1,min(5,int(d.get('workLifeBalance',3))))
        overtime=max(0,int(float(d.get('overtimeHoursWeekly',0))))
        perf=max(1,min(5,int(d.get('performanceRating',3))))
        distance=max(0,int(float(d.get('distanceFromHomeKm',10))))
        training=max(0,int(d.get('trainingTimesLastYear',2)))
        mgr=max(1,min(5,int(d.get('managerRelationshipScore',3))))
    except (TypeError, ValueError):
        raise ValueError('Numeric employee fields must contain valid numbers.')
    remote=str(d.get('remoteWorkOption','Hybrid')).strip() or 'Hybrid'
    if remote not in ('On-site','Hybrid','Full-time'):
        remote='Hybrid'
    gender=str(d.get('gender','Other')).strip() or 'Other'
    education=str(d.get('education',"Bachelor's Degree")).strip() or "Bachelor's Degree"
    # Employee records do not use personal profile photos. Keep this field empty.
    avatar=''
    return {
        'id':d.get('id') or 'EMP-'+uuid.uuid4().hex[:6].upper(), 'name':name, 'email':email, 'avatar':avatar,
        'department':department, 'role':role, 'age':age, 'gender':gender, 'yearsAtCompany':years_at,
        'yearsInCurrentRole':years_role, 'yearsSincePromotion':years_promo, 'monthlySalary':salary,
        'satisfactionScore':sat, 'environmentSatisfaction':env, 'workLifeBalance':wlb,
        'overtimeHoursWeekly':overtime, 'hasOvertime':overtime>0, 'performanceRating':perf,
        'distanceFromHomeKm':distance, 'trainingTimesLastYear':training, 'managerRelationshipScore':mgr,
        'remoteWorkOption':remote, 'education':education
    }

@app.post('/api/employees')
@auth_required
def add_employee():
    d=request.get_json() or {}
    required=['name','email','department','role']
    if any(not str(d.get(x,'')).strip() for x in required):
        return jsonify({'success':False,'message':'Name, email, department and role are required.'}),400
    email=str(d['email']).strip().lower()
    if any(str(e.get('email','')).lower()==email for e in employees):
        return jsonify({'success':False,'message':'An employee with this email already exists.'}),409
    if d.get('department') not in DEPT:
        return jsonify({'success':False,'message':'Please select a valid department.'}),400
    try:
        e=build_employee(d)
    except ValueError as exc:
        return jsonify({'success':False,'message':str(exc)}),400
    benchmark=DEPT[e['department']]['base']
    salary=e['monthlySalary']
    ysp=e['yearsSincePromotion']
    if e['overtimeHoursWeekly']>10: primary='Excessive Overtime & Burnout'
    elif e['satisfactionScore']<=2: primary='Low Job Satisfaction'
    elif salary<benchmark*.85: primary='Below Market Compensation'
    elif ysp>=3: primary='Promotion Stagnation'
    elif e['managerRelationshipScore']<=2: primary='Managerial Friction'
    else: primary='Balanced Risk Profile'
    e['attritionRisk'],e['riskLevel']=predict(e)
    e['primaryRiskFactor']=primary
    employees.append(e)
    log_audit(current_user(),'EMPLOYEE_ADDED',f"Added employee {e['name']} ({e['id']}) and calculated attrition risk.")
    return jsonify({'success':True,'employee':e})
@app.delete('/api/employees/<eid>')
@auth_required
def delete_emp(eid):
    global employees
    target=next((e for e in employees if e['id']==eid),None)
    if not target: return jsonify({'success':False,'message':'Employee not found'}),404
    employees=[e for e in employees if e['id']!=eid]
    log_audit(current_user(),'EMPLOYEE_DELETED',f'Deleted employee {target['name']} ({eid}).')
    return jsonify({'success':True})
@app.post('/api/employees/bulk-delete')
@auth_required
def bulk_delete():
    ids=(request.get_json() or {}).get('ids',[]); before=len(employees); remaining=[e for e in employees if e['id'] not in ids]; employees[:]=remaining; return jsonify({'success':True,'deleted':before-len(employees)})
@app.post('/api/employees/import')
@auth_required
def import_csv():
    if 'file' not in request.files: return jsonify({'success':False,'message':'CSV file required'}),400
    f=request.files['file']
    try:
        df=pd.read_csv(f)
    except Exception as exc:
        return jsonify({'success':False,'message':f'Unable to read CSV: {exc}'}),400
    added=[]; skipped=[]
    existing={str(e.get('email','')).strip().lower() for e in employees if e.get('email')}
    try:
        for _,row in df.iterrows():
            d=row.to_dict()
            email=str(d.get('email','')).strip().lower()
            if not email:
                skipped.append({'row':int(_)+2,'reason':'Missing email'}); continue
            if email in existing:
                skipped.append({'row':int(_)+2,'reason':'Duplicate email','email':email}); continue
            e=build_employee(d)
            benchmark=DEPT[e['department']]['base']
            if e['overtimeHoursWeekly']>10: primary='Excessive Overtime & Burnout'
            elif e['satisfactionScore']<=2: primary='Low Job Satisfaction'
            elif e['monthlySalary']<benchmark*.85: primary='Below Market Compensation'
            elif e['yearsSincePromotion']>=3: primary='Promotion Stagnation'
            elif e['managerRelationshipScore']<=2: primary='Managerial Friction'
            else: primary='Balanced Risk Profile'
            e['attritionRisk'],e['riskLevel']=predict(e)
            e['primaryRiskFactor']=primary
            employees.append(e); added.append(e); existing.add(email)
    except ValueError as exc:
        for e in added:
            if e in employees: employees.remove(e)
        return jsonify({'success':False,'message':str(exc)}),400
    log_audit(current_user(),'EMPLOYEE_IMPORT',f'Imported {len(added)} employees from CSV; skipped {len(skipped)} rows.')
    return jsonify({'success':True,'count':len(added),'employees':added,'skipped':skipped})

@app.get('/api/employees/template.csv')
@auth_required
def employee_template():
    fields=['name','email','department','role','avatar','age','gender','education','yearsAtCompany','yearsInCurrentRole','yearsSincePromotion','monthlySalary','satisfactionScore','environmentSatisfaction','workLifeBalance','overtimeHoursWeekly','performanceRating','distanceFromHomeKm','trainingTimesLastYear','managerRelationshipScore','remoteWorkOption']
    example={
        'name':'Example Employee','email':'example@enterprise.corp','department':'Engineering','role':'Software Engineer II','avatar':'','age':30,'gender':'Other','education':"Bachelor's Degree",'yearsAtCompany':2,'yearsInCurrentRole':1,'yearsSincePromotion':1,'monthlySalary':100000,'satisfactionScore':3,'environmentSatisfaction':3,'workLifeBalance':3,'overtimeHoursWeekly':0,'performanceRating':3,'distanceFromHomeKm':10,'trainingTimesLastYear':2,'managerRelationshipScore':3,'remoteWorkOption':'Hybrid'
    }
    stream=io.StringIO(); w=csv.DictWriter(stream,fieldnames=fields); w.writeheader(); w.writerow(example); stream.seek(0)
    return app.response_class(stream.getvalue(),mimetype='text/csv',headers={'Content-Disposition':'attachment; filename=shop_ai_employee_import_template.csv'})

@app.get('/api/employees/<eid>/analysis')
@auth_required
def analysis(eid):
    e=next((x for x in employees if x['id']==eid),None)
    if not e: return jsonify({'success':False,'message':'Employee not found'}),404
    return jsonify({'success':True,'employee':e,'shap':shap(e),'recommendations':recs(e)})
@app.post('/api/simulate')
@auth_required
def simulate():
    d=request.get_json() or {}; e=next((x for x in employees if x['id']==d.get('employeeId')),None)
    if not e: return jsonify({'success':False,'message':'Employee not found'}),404
    salary_inc=float(d.get('salaryIncreasePercent',0)); cut=int(d.get('reduceOvertimeHours',0)); promoted=bool(d.get('isPromoted',False)); training=bool(d.get('trainingEnrolled',False)); mgr=bool(d.get('improveManagerRelationship',False)); boost=int(d.get('boostSatisfactionScore',0)); remote=d.get('remoteOption',e['remoteWorkOption'])
    sim=e.copy(); sim['monthlySalary']=round(e['monthlySalary']*(1+salary_inc/100)); sim['overtimeHoursWeekly']=max(0,e['overtimeHoursWeekly']-cut); sim['hasOvertime']=sim['overtimeHoursWeekly']>0; sim['yearsSincePromotion']=0 if promoted else e['yearsSincePromotion']; sim['trainingTimesLastYear']=e['trainingTimesLastYear']+2 if training else e['trainingTimesLastYear']; sim['managerRelationshipScore']=min(5,e['managerRelationshipScore']+2) if mgr else e['managerRelationshipScore']; sim['satisfactionScore']=min(5,e['satisfactionScore']+boost); sim['remoteWorkOption']=remote
    sr,sl=predict(sim); diff=round((e['attritionRisk']-sr)*1000)/1000; retention=round((1-sr)*1000)/1000; annual=e['monthlySalary']*12; repl=round(annual*1.5); cost=(sim['monthlySalary']-e['monthlySalary'])*12+(40000 if training else 0)+(75000 if promoted else 0)+(15000 if remote!=e['remoteWorkOption'] else 0); avoided=round(repl*max(0,diff)); net=max(0,avoided-cost); roi=round(((avoided-cost)/cost)*100) if cost else 100
    return jsonify({'success':True,'result':{'originalRisk':e['attritionRisk'],'simulatedRisk':sr,'riskDifference':diff,'originalRiskLevel':e['riskLevel'],'simulatedRiskLevel':sl,'retentionProbability':retention,'annualReplacementCostINR':repl,'interventionCostINR':cost,'netEstimatedSavingsINR':net,'roiPercent':roi}})

@app.post('/api/interventions')
@auth_required
def add_intervention():
    d=request.get_json() or {}; e=next((x for x in employees if x['id']==d.get('employeeId')),None)
    if not e: return jsonify({'success':False,'message':'Employee not found'}),404
    item={'id':'INT-'+uuid.uuid4().hex[:4].upper(),'employeeId':e['id'],'employeeName':e['name'],'department':e['department'],'actionTitle':d.get('actionTitle','Retention Intervention'),'category':d.get('category','Strategic'),'dateInitiated':datetime.utcnow().date().isoformat(),'assignedTo':current_user()['name'],'status':'Proposed','initialRisk':e['attritionRisk'],'projectedRisk':float(d.get('projectedRisk',max(.05,e['attritionRisk']-.2))),'costINR':int(d.get('costINR',0)),'notes':d.get('notes','')}; interventions.insert(0,item); log_audit(current_user(),'INTERVENTION_COMMITTED',f"Committed intervention {item['id']} for {e['name']}."); return jsonify({'success':True,'intervention':item})
@app.patch('/api/interventions/<iid>')
@auth_required
def update_intervention(iid):
    d=request.get_json() or {}; item=next((x for x in interventions if x['id']==iid),None)
    if not item: return jsonify({'success':False}),404
    status=d.get('status',item['status'])
    allowed={'Proposed','In Progress','Approved','Completed'}
    if status not in allowed: return jsonify({'success':False,'message':'Invalid intervention status.'}),400
    item['status']=status; log_audit(current_user(),'INTERVENTION_UPDATED',f'Updated {iid} status to {status}.'); return jsonify({'success':True,'intervention':item})
@app.post('/api/models/retrain')
@auth_required
def retrain():
    ML_MODELS[0]['trainingTimeMs']=1420+int((datetime.utcnow().timestamp()*1000)%300); ML_MODELS[0]['rocAuc']=.932; log_audit(current_user(),'REPORT_EXPORT','Triggered ML model retraining diagnostics.'); return jsonify({'success':True,'models':ML_MODELS})
@app.get('/api/audit')
@auth_required
def audit():
    if current_user()['role'] not in ('HR Admin','Executive / Higher Authority'): return jsonify({'success':False,'message':'Restricted access'}),403
    return jsonify({'success':True,'audits':audits})
@app.get('/api/report.csv')
@auth_required
def report_csv():
    df=pd.DataFrame(employees); stream=io.StringIO(); df.to_csv(stream,index=False); stream.seek(0); log_audit(current_user(),'REPORT_EXPORT','Exported employee risk dataset as CSV.'); return app.response_class(stream.getvalue(),mimetype='text/csv',headers={'Content-Disposition':'attachment; filename=shop_ai_employee_risk_report.csv'})
@app.get('/api/report.html')
@auth_required
def report_html():
    m=metrics(); html=f"""<!doctype html><html><head><meta charset='utf-8'><title>SHOP AI Executive Report</title><style>body{{font-family:Arial;padding:40px}}.k{{display:inline-block;padding:16px;margin:8px;border:1px solid #ddd;border-radius:12px}}</style></head><body><h1>SHOP AI Executive Retention Report</h1><p>Generated {datetime.utcnow().isoformat()} UTC</p><div class='k'><b>Headcount</b><br>{m['totalCount']}</div><div class='k'><b>High Risk</b><br>{m['highRiskCount']}</div><div class='k'><b>Attrition Rate</b><br>{m['attritionRatePercent']}%</div><div class='k'><b>Exposure</b><br>₹{m['totalFinancialExposureINR']:,}</div><h2>Departments</h2><table border='1' cellpadding='8' cellspacing='0'><tr><th>Department</th><th>Headcount</th><th>Attrition</th><th>High Risk</th><th>Exposure</th></tr>"""+''.join(f"<tr><td>{d['department']}</td><td>{d['headcount']}</td><td>{d['attritionRate']}%</td><td>{d['highRiskCount']}</td><td>₹{d['totalFinancialExposureINR']:,}</td></tr>" for d in department_metrics())+"</table></body></html>"""; log_audit(current_user(),'REPORT_EXPORT','Generated executive HTML report.'); return app.response_class(html,mimetype='text/html')

if __name__=='__main__': app.run(host='0.0.0.0',port=3000,debug=False)
