import { Employee, RiskLevel } from '../types';
import { predictAttritionProbability } from '../ml/engine';

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Vikram', 'Neha', 'Kavya', 'Rahul',
  'Ishaan', 'Tanvi', 'Arjun', 'Meera', 'Varun', 'Deepika', 'Karthik', 'Pooja', 'Siddharth', 'Riya',
  'Amit', 'Divya', 'Suresh', 'Kiran', 'Manish', 'Shreya', 'Gaurav', 'Nisha', 'Rajesh', 'Preeti',
  'Dev', 'Swati', 'Harsh', 'Anjali', 'Akash', 'Shruti', 'Nikhil', 'Simran', 'Alok', 'Bhavna',
  'Sameer', 'Monika', 'Abhishek', 'Rashmi', 'Sachin', 'Komal', 'Pranav', 'Payal', 'Tushar', 'Geeta'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Iyer', 'Nair', 'Reddy', 'Chopra', 'Gupta', 'Singh', 'Deshmukh',
  'Kulkarni', 'Mehta', 'Joshi', 'Bose', 'Menon', 'Rao', 'Agarwal', 'Chatterjee', 'Bhat', 'Malhotra',
  'Saxena', 'Kapoor', 'Pandey', 'Mishra', 'Bhattacharya', 'Chauhan', 'Thakur', 'Yadav', 'Dubey', 'Soni'
];

const DEPARTMENTS_DATA = [
  {
    name: 'Engineering',
    roles: ['Senior Full-Stack Engineer', 'Lead Cloud Architect', 'Staff DevOps Engineer', 'Software Engineer II', 'Frontend Developer', 'Data Platform Engineer', 'QA Automation Lead'],
    baseSalary: 145000,
    salaryVariance: 65000,
  },
  {
    name: 'Product',
    roles: ['Principal Product Manager', 'Senior Product Designer', 'Technical Product Manager', 'Associate PM', 'UX Research Lead', 'Product Operations Manager'],
    baseSalary: 155000,
    salaryVariance: 60000,
  },
  {
    name: 'Sales',
    roles: ['Enterprise Account Executive', 'Sales Director', 'Business Development Rep', 'Strategic Account Manager', 'Client Solutions Consultant', 'Inbound Sales Specialist'],
    baseSalary: 110000,
    salaryVariance: 50000,
  },
  {
    name: 'Marketing',
    roles: ['Performance Marketing Lead', 'Content Strategist', 'Growth Marketing Manager', 'Brand Marketing Specialist', 'SEO/SEM Analyst', 'Lifecycle Marketer'],
    baseSalary: 98000,
    salaryVariance: 38000,
  },
  {
    name: 'Human Resources',
    roles: ['Senior HRBP', 'Talent Acquisition Partner', 'People Operations Lead', 'Compensation & Benefits Specialist', 'Learning & Development Manager'],
    baseSalary: 88000,
    salaryVariance: 32000,
  },
  {
    name: 'Operations',
    roles: ['Operations Program Manager', 'IT Systems Administrator', 'Supply Chain Analyst', 'Procurement Specialist', 'Facilities Manager'],
    baseSalary: 85000,
    salaryVariance: 30000,
  },
];

// Linear congruential pseudorandom generator for deterministic reproducible seeding
function createRng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateRealisticEmployees(targetCount: number = 520): Employee[] {
  const rng = createRng(42);
  const employees: Employee[] = [];

  for (let i = 1; i <= targetCount; i++) {
    const id = `EMP-${String(i).padStart(4, '0')}`;
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    const gender: 'Male' | 'Female' | 'Other' = rng() < 0.48 ? 'Female' : rng() < 0.96 ? 'Male' : 'Other';

    // Department & Role selection with deliberate high-risk clustering (e.g. Engineering & Sales)
    const deptObj = DEPARTMENTS_DATA[Math.floor(rng() * DEPARTMENTS_DATA.length)];
    const department = deptObj.name;
    const role = deptObj.roles[Math.floor(rng() * deptObj.roles.length)];

    // Controlled profiles to ensure approximately 186 high-risk, 185 medium-risk, 149 low-risk
    // We calibrate 3 archetypes: High Risk (~36%), Medium Risk (~36%), Low Risk (~28%)
    const archetypeRoll = rng();
    let isHighRiskProfile = archetypeRoll < 0.358;
    let isMedRiskProfile = !isHighRiskProfile && archetypeRoll < 0.715;

    let satisfactionScore: number;
    let overtimeHoursWeekly: number;
    let hasOvertime: boolean;
    let yearsSincePromotion: number;
    let managerRelationshipScore: number;
    let monthlySalary: number;
    let workLifeBalance: number;
    let yearsAtCompany: number;
    let yearsInCurrentRole: number;
    let age: number;
    let distanceFromHomeKm: number;
    let trainingTimesLastYear: number;
    let remoteWorkOption: 'Full-time' | 'Hybrid' | 'On-site';
    let performanceRating: number;

    if (isHighRiskProfile) {
      // Dissatisfied, high overtime, stagnant promotion, underpaid
      satisfactionScore = rng() < 0.6 ? 1 : 2;
      overtimeHoursWeekly = Math.floor(10 + rng() * 18); // 10 to 27 hours
      hasOvertime = true;
      yearsSincePromotion = Math.floor(3 + rng() * 4); // 3 to 6 years
      managerRelationshipScore = rng() < 0.7 ? 1 : 2;
      monthlySalary = Math.round((deptObj.baseSalary * (0.68 + rng() * 0.22)) / 1000) * 1000; // Below median
      workLifeBalance = rng() < 0.7 ? 1 : 2;
      yearsAtCompany = Math.floor(3 + rng() * 6);
      yearsInCurrentRole = Math.min(yearsAtCompany, Math.floor(2 + rng() * 4));
      age = Math.floor(26 + rng() * 16);
      distanceFromHomeKm = Math.floor(15 + rng() * 30);
      trainingTimesLastYear = rng() < 0.6 ? 0 : 1;
      remoteWorkOption = rng() < 0.6 ? 'On-site' : 'Hybrid';
      performanceRating = rng() < 0.5 ? 4 : 3; // Often talented contributors who feel under-appreciated
    } else if (isMedRiskProfile) {
      // Moderate engagement, occasional overtime, moderate compensation
      satisfactionScore = 3;
      overtimeHoursWeekly = rng() < 0.5 ? Math.floor(3 + rng() * 6) : 0;
      hasOvertime = overtimeHoursWeekly > 0;
      yearsSincePromotion = Math.floor(1 + rng() * 3);
      managerRelationshipScore = 3;
      monthlySalary = Math.round((deptObj.baseSalary * (0.9 + rng() * 0.2)) / 1000) * 1000;
      workLifeBalance = 3;
      yearsAtCompany = Math.floor(2 + rng() * 5);
      yearsInCurrentRole = Math.min(yearsAtCompany, Math.floor(1 + rng() * 3));
      age = Math.floor(25 + rng() * 18);
      distanceFromHomeKm = Math.floor(8 + rng() * 20);
      trainingTimesLastYear = Math.floor(1 + rng() * 3);
      remoteWorkOption = rng() < 0.5 ? 'Hybrid' : 'Full-time';
      performanceRating = 3;
    } else {
      // High satisfaction, no overtime, recently promoted, well-compensated
      satisfactionScore = rng() < 0.5 ? 4 : 5;
      overtimeHoursWeekly = 0;
      hasOvertime = false;
      yearsSincePromotion = Math.floor(rng() * 2); // 0 to 1 year
      managerRelationshipScore = rng() < 0.4 ? 4 : 5;
      monthlySalary = Math.round((deptObj.baseSalary * (1.15 + rng() * 0.35)) / 1000) * 1000;
      workLifeBalance = rng() < 0.4 ? 4 : 5;
      yearsAtCompany = Math.floor(2 + rng() * 8);
      yearsInCurrentRole = Math.floor(1 + rng() * 3);
      age = Math.floor(28 + rng() * 20);
      distanceFromHomeKm = Math.floor(3 + rng() * 14);
      trainingTimesLastYear = Math.floor(2 + rng() * 4);
      remoteWorkOption = rng() < 0.6 ? 'Hybrid' : 'Full-time';
      performanceRating = rng() < 0.6 ? 4 : 5;
    }

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@enterprise.corp`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    // Run ML model for ground-truth prediction
    const candidateEmp: Partial<Employee> = {
      id,
      name,
      department,
      role,
      age,
      yearsAtCompany,
      yearsInCurrentRole,
      yearsSincePromotion,
      monthlySalary,
      satisfactionScore,
      environmentSatisfaction: satisfactionScore,
      workLifeBalance,
      overtimeHoursWeekly,
      hasOvertime,
      performanceRating,
      distanceFromHomeKm,
      trainingTimesLastYear,
      managerRelationshipScore,
      remoteWorkOption,
    };

    const { risk: calculatedRisk, riskLevel: calculatedLevel } = predictAttritionProbability(
      candidateEmp,
      'xgboost'
    );

    // Identify primary risk factor
    let primaryRiskFactor = 'Balanced Risk Profile';
    if (overtimeHoursWeekly > 10) primaryRiskFactor = 'Excessive Overtime & Burnout';
    else if (satisfactionScore <= 2) primaryRiskFactor = 'Low Job Satisfaction';
    else if (monthlySalary < deptObj.baseSalary * 0.85) primaryRiskFactor = 'Below Market Compensation';
    else if (yearsSincePromotion >= 3) primaryRiskFactor = 'Promotion Stagnation';
    else if (managerRelationshipScore <= 2) primaryRiskFactor = 'Managerial Friction';

    employees.push({
      id,
      name,
      email,
      avatar,
      department,
      role,
      age,
      gender,
      yearsAtCompany,
      yearsInCurrentRole,
      yearsSincePromotion,
      monthlySalary,
      satisfactionScore,
      environmentSatisfaction: satisfactionScore,
      workLifeBalance,
      overtimeHoursWeekly,
      hasOvertime,
      performanceRating,
      distanceFromHomeKm,
      trainingTimesLastYear,
      managerRelationshipScore,
      remoteWorkOption,
      education: rng() < 0.7 ? "Master's Degree" : "Bachelor's Degree",
      attritionRisk: calculatedRisk,
      riskLevel: calculatedLevel,
      primaryRiskFactor,
    });
  }

  return employees;
}

export const INITIAL_EMPLOYEES: Employee[] = generateRealisticEmployees(520);
