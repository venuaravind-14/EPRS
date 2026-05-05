const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');
const Department = require('./models/Department');
const Team = require('./models/Team');
const Goal = require('./models/Goal');
const Task = require('./models/Task');
const TaskReview = require('./models/TaskReview');
const SelfAssessment = require('./models/SelfAssessment');
const GoalReview = require('./models/GoalReview');

dotenv.config();

const fullNames = [
    
    
    
    "Aravind Kumar", "Karthikeyan S", "Prakash Raj", "Suresh Babu", "Vijayalakshmi R", 
    "Meenakshi Sundaram", "Raghavan Iyer", "Senthil Kumar", "Balaji Narayanan", "Dinesh Kumar", 
    "Lakshmi Priya", "Rajeshwari K", "Murugan P", "Anand Krishnan", "Gopinath R", 
    "Venkatesh I", "Natarajan S", "Harishankar V", "Shanmugam K", "Balamurugan T", 
    "Ravi Chandran", "Priya Raman", "Deepak Sharma", "Amit Verma", "Neha Gupta", 
    "Kavin Kumar", "Ajith Kumar", "Surya Prakash", "Manoj Kumar", "Naveen Raj", 
    "Hariharan S", "Vishnu Prasad", "Bharath Kumar", "Dhanush K", "Praveen Kumar", 
    "Ramesh B", "Lokesh Kumar", "Saravanan M", "Tharun Kumar", "Vignesh S", 
    "Yuvaraj P", "Elango K", "Gokul Raj", "Ilango S", "Jagadeesh R", 
    "Karthikeya N", "Madhan Kumar", "Nithin Kumar", "Prasanna V", "Rajkumar S", 
    "Siva Kumar", "Tamilselvan R", "Uday Kumar", "Vasanth Kumar", "Vinoth Kumar", 
    "Yamunesh R", "Abinaya S", "Divya Bharathi", "Gayathri Devi", "Harini K", 
    "Janani R", "Keerthana S", "Lavanya M", "Monisha P", "Nandhini R", 
    "Rahul Sharma", "Rohit Singh", "Ankit Jain", "Pooja Sharma", "Sneha Patel", 
    "Kavita Gupta", "Rohan Mehta", "Ayesha Khan", "Imran Ali", "Arjun Kapoor"
];

const generateName = (index) => {
    return fullNames[index % fullNames.length];
};




const seedEnterprise = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // 1. Clear all existing data
        await Promise.all([
            User.deleteMany({}),
            Department.deleteMany({}),
            Team.deleteMany({}),
            Goal.deleteMany({}),
            Task.deleteMany({}),
            TaskReview.deleteMany({}),
            SelfAssessment.deleteMany({}),
            GoalReview.deleteMany({})
        ]);
        console.log('Cleared all previous data.');

        const commonPassword = await bcrypt.hash('password123', 10);

        let userCounter = 0;

        // 2. HR Leadership
        const hrDirector = new User({
            username: fullNames[0].toLowerCase().replace(/ /g, ''),
            email: `${fullNames[0].toLowerCase().replace(/ /g, '')}@revx.com`,
            password: commonPassword,
            role: 'hr',
            hrDetails: {}
        });
        await hrDirector.save();
        userCounter++;

        // 3. Departments
        const deptSpecs = [
            { name: 'Engineering', desc: 'Product development and infrastructure' },
            { name: 'Sales', desc: 'Direct sales and account management' },
            { name: 'Marketing', desc: 'Brand management and digital growth' },
            { name: 'Finance', desc: 'Audit, planning, and accounting' },
            { name: 'Human Resources', desc: 'Talent and culture' },
            { name: 'Customer Success', desc: 'Post-sales support and retention' },
            { name: 'Operations', desc: 'Logistics and strategy' },
            { name: 'Legal', desc: 'Compliance and regulatory affairs' }
        ];

        const depts = [];
        for (const spec of deptSpecs) {
            const d = new Department({
                departmentName: spec.name,
                description: spec.desc,
                createdBy: hrDirector._id
            });
            await d.save();
            depts.push(d);
        }

        // 4. Create 8 Managers
        const managers = [];
        for (let i = 0; i < 8; i++) {
            const name = generateName(userCounter++); 
            const dept = depts[i % depts.length];
            const m = new User({
                username: name.toLowerCase().replace(/ /g, ''),
                email: `${name.toLowerCase().replace(/ /g, '')}@revx.com`,
                password: commonPassword,
                role: 'manager',
                managerDetails: { department: dept._id }
            });
            await m.save();
            managers.push(m);
        }

        // 5. Create 44 Employees (Not a uniform distribution)
        const employees = [];
        const designations = ['Specialist', 'Lead', 'Consultant', 'Analyst', 'Associate', 'Engineer', 'Advisor'];
        for (let i = 0; i < 44; i++) {
            const name = generateName(userCounter++);
            const dept = depts[i % depts.length];
            const e = new User({
                username: name.toLowerCase().replace(/ /g, ''),
                email: `${name.toLowerCase().replace(/ /g, '')}@revx.com`,
                password: commonPassword,
                role: 'employee',
                employeeDetails: {
                    department: dept._id,
                    designation: designations[i % designations.length],
                    joiningDate: new Date('2025-06-20')
                }
            });
            await e.save();
            employees.push(e);
        }





        // 6. Create Teams (Aligned by Department: Each manager gets employees from their dept)
        const teams = [];
        for (let i = 0; i < managers.length; i++) {
            const manager = managers[i];
            const deptId = manager.managerDetails.department;
            const dept = depts.find(d => d._id.equals(deptId));
            
            // Filter employees who belong to this manager's department
            const deptEmployees = employees.filter(e => e.employeeDetails.department.equals(deptId));

            const t = new Team({
                teamName: `${dept.departmentName} - Team ${String.fromCharCode(65 + i)}`,
                members: [manager._id, ...deptEmployees.map(tm => tm._id)],
                createdBy: hrDirector._id,
                departmentId: deptId
            });
            await t.save();
            teams.push(t);
        }



        // 7. Create Goals for 2026
        const goals = [];
        for (let i = 0; i < 16; i++) {
            const team = teams[i % teams.length];
            const manager = managers.find(m => team.members.includes(m._id));
            const start = new Date('2026-05-01');
            start.setMonth(start.getMonth() + (i % 4));
            const due = new Date(start);
            due.setMonth(start.getMonth() + 3);

            const g = new Goal({
                projectTitle: `Goal Phase ${Math.floor(i/8) + 1}: ${team.teamName}`,
                startDate: start,
                dueDate: due,
                status: i % 4 === 0 ? 'completed' : 'in-progress',
                teamId: team._id,
                managerId: manager._id,
                description: `Strategic objective for ${team.teamName}.`
            });
            await g.save();
            goals.push(g);

            // Goal Review Cycles
            const grStatuses = ['Pending', 'Completed', 'In-Review', 'Scheduled'];
            const grStatus = grStatuses[i % grStatuses.length];
            const gr = new GoalReview({
                hrAdminId: hrDirector._id,
                managerId: manager._id,
                teamId: team._id,
                goalId: g._id,
                description: `Performance evaluation for ${g.projectTitle}`,
                dueDate: new Date('2026-12-31'),
                status: grStatus,
                managerReview: grStatus === 'Completed' ? 'Consistent progress and milestone achievement.' : undefined,
                submissionDate: grStatus === 'Completed' ? new Date('2026-11-20') : null
            });
            await gr.save();

        }


        // 8. Create Tasks & Reviews (Correlated with ALL members)
        for (let i = 0; i < goals.length; i++) {
            const goal = goals[i];
            const team = teams.find(t => t._id.equals(goal.teamId));
            const teamEmps = team.members.filter(mid => employees.some(e => e._id.equals(mid)));
            
            for (let j = 0; j < teamEmps.length; j++) {
                const empId = teamEmps[j];
                const ts = new Date(goal.startDate);
                ts.setDate(ts.getDate() + (j * 5));
                const td = new Date(ts);
                td.setDate(td.getDate() + 10);

                const t = new Task({
                    projectId: goal._id,
                    taskTitle: `Task ${j + 1}: ${goal.projectTitle}`,
                    status: goal.status === 'completed' ? 'completed' : (j % 2 === 0 ? 'in-progress' : 'scheduled'),
                    priority: j % 2 === 0 ? 'high' : 'medium',
                    employeeId: empId,
                    managerId: goal.managerId,
                    description: `Core task for ${goal.projectTitle}.`,
                    startDate: ts,
                    dueDate: td
                });
                await t.save();

                // Self Assessment
                if (t.status === 'completed') {
                    const sa = new SelfAssessment({
                        employeeId: empId,
                        managerId: goal.managerId,
                        taskId: t._id,
                        comments: 'Target met with high quality documentation.',
                        status: 'submitted'
                    });
                    await sa.save();
                }

                // Diversified Task Review Assignments
                if (j % 2 === 0 || i % 3 === 0) {
                    const trStatuses = ['Pending', 'Completed', 'In-Review', 'Scheduled'];
                    const trStatus = trStatuses[(j + i) % trStatuses.length];
                    const tr = new TaskReview({
                        hrAdminId: hrDirector._id,
                        departmentId: team.departmentId,
                        teamId: team._id,
                        projectId: goal._id,
                        taskId: t._id,
                        employeeId: empId,
                        description: `Audit for ${t.taskTitle}: Quality and compliance check.`,
                        dueDate: new Date('2026-10-15'),
                        taskDueDate: t.dueDate,
                        status: trStatus,
                        employeeReview: trStatus === 'Completed' ? 'Successfully followed all standard protocols.' : undefined,
                        submissionDate: trStatus === 'Completed' ? new Date('2026-06-25') : undefined
                    });
                    await tr.save();
                }

            }
        }


        console.log('\n--- ENTERPRISE SEEDING SUCCESSFUL (DIVERSIFIED) ---');
        console.log(`✅ HR DIRECTOR: ${hrDirector.username}`);
        console.log(`✅ EMPLOYEES:   ${employees.length} (Irregularly Distributed)`);
        console.log(`✅ GOAL REVIEWS: Assigned to Managers`);
        console.log(`✅ TASK REVIEWS: Diversified Statuses`);
        console.log('\nAll passwords: "password123"');
        console.log('-------------------------------------\n');

        console.log('--- LOGIN CREDENTIALS ---');
        console.log('HR:');
        console.log(`- ${hrDirector.username} / password123`);
        console.log('MANAGERS:');
        managers.forEach(m => console.log(`- ${m.username} / password123`));
        console.log('EMPLOYEES:');
        employees.forEach(e => console.log(`- ${e.username} / password123`));


        process.exit(0);
    } catch (err) {
        console.error('Enterprise Seeding Failed:', err);
        process.exit(1);
    }
};

seedEnterprise();
