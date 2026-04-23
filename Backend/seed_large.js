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

const seedLarge = async () => {
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

        // 2. Passwords
        const commonPassword = await bcrypt.hash('password123', 10);

        // 3. Create HR Admin
        const hrAdmin = new User({
            username: 'HR_Director',
            email: 'director.hr@revx.com',
            password: commonPassword,
            role: 'hr',
            hrDetails: {}
        });
        await hrAdmin.save();
        console.log('HR Admin created.');

        // 4. Create Departments
        const deptNames = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Operations', 'Customer Success'];
        const depts = [];
        for (const name of deptNames) {
            const d = new Department({
                departmentName: name,
                description: `${name} department for RevX Global`,
                createdBy: hrAdmin._id
            });
            await d.save();
            depts.push(d);
        }
        console.log(`${depts.length} Departments created.`);

        // 5. Create Managers
        const managers = [];
        for (let i = 0; i < depts.length * 2; i++) {
            const dept = depts[i % depts.length];
            const m = new User({
                username: `Manager_${i + 1}`,
                email: `manager${i + 1}@revx.com`,
                password: commonPassword,
                role: 'manager',
                managerDetails: { department: dept._id }
            });
            await m.save();
            managers.push(m);
        }
        console.log(`${managers.length} Managers created.`);

        // 6. Create Employees
        const employees = [];
        const designations = ['Junior Associate', 'Senior Associate', 'Lead Specialist', 'Coordinator', 'Analyst'];
        for (let i = 0; i < 50; i++) {
            const dept = depts[i % depts.length];
            const e = new User({
                username: `Employee_${i + 1}`,
                email: `employee${i + 1}@revx.com`,
                password: commonPassword,
                role: 'employee',
                employeeDetails: {
                    department: dept._id,
                    designation: designations[i % designations.length],
                    joiningDate: new Date('2025-01-15')
                }
            });
            await e.save();
            employees.push(e);
        }
        console.log(`${employees.length} Employees created.`);

        // 7. Create Teams
        const teams = [];
        for (let i = 0; i < managers.length; i++) {
            const manager = managers[i];
            const dept = depts.find(d => d._id.equals(manager.managerDetails.department));
            const teamMembers = employees.filter(e => e.employeeDetails.department.equals(dept._id))
                                .slice(0, 5); // 5 members per team
            
            const t = new Team({
                teamName: `${dept.departmentName} Team ${i + 1}`,
                members: [manager._id, ...teamMembers.map(tm => tm._id)],
                createdBy: hrAdmin._id,
                departmentId: dept._id
            });
            await t.save();
            teams.push(t);
        }
        console.log(`${teams.length} Teams created.`);

        // 8. Create Goals (Projects) for 2026
        const goals = [];
        const currentMonth = new Date('2026-04-01');
        for (let i = 0; i < 15; i++) {
            const team = teams[i % teams.length];
            const manager = managers.find(m => team.members.includes(m._id));
            
            const startDate = new Date(currentMonth);
            startDate.setMonth(currentMonth.getMonth() + (i % 3)); // Start in Apr, May, or Jun
            
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + 3); // Duration 3 months
            
            const g = new Goal({
                projectTitle: `Project Ultra ${i + 1}`,
                startDate,
                dueDate,
                status: i % 3 === 0 ? 'completed' : 'in-progress',
                teamId: team._id,
                managerId: manager._id,
                description: `A large scale organizational initiative focusing on ${team.teamName} excellence.`
            });
            await g.save();
            goals.push(g);
        }
        console.log(`${goals.length} Goals created for 2026.`);

        // 9. Create Tasks
        const tasks = [];
        const taskStatuses = ['completed', 'in-progress', 'scheduled'];
        const priorities = ['low', 'medium', 'high'];
        
        for (let i = 0; i < goals.length; i++) {
            const goal = goals[i];
            const team = teams.find(t => t._id.equals(goal.teamId));
            const teamEmployees = team.members.filter(m => employees.some(e => e._id.equals(m)));
            
            // Create 5-8 tasks per goal
            const numTasks = 5 + (i % 4);
            for (let j = 0; j < numTasks; j++) {
                const employeeId = teamEmployees[j % teamEmployees.length];
                
                const taskStart = new Date(goal.startDate);
                taskStart.setDate(taskStart.getDate() + (j * 5));
                
                const taskDue = new Date(taskStart);
                taskDue.setDate(taskDue.getDate() + 15);
                
                const t = new Task({
                    projectId: goal._id,
                    taskTitle: `Phase ${j + 1}: ${goal.projectTitle} Execution`,
                    status: goal.status === 'completed' ? 'completed' : taskStatuses[j % 3],
                    priority: priorities[j % 3],
                    employeeId,
                    managerId: goal.managerId,
                    description: `Detailed task implementation for ${goal.projectTitle} phase ${j + 1}.`,
                    startDate: taskStart,
                    dueDate: taskDue
                });
                await t.save();
                tasks.push(t);
            }
        }
        console.log(`${tasks.length} Tasks assigned.`);

        // 10. Create some Reviews and Assessments
        const completedTasks = tasks.filter(t => t.status === 'completed').slice(0, 20);
        for (let i = 0; i < completedTasks.length; i++) {
            const task = completedTasks[i];
            
            // Task Review
            if (i % 2 === 0) {
                const tr = new TaskReview({
                    hrAdminId: hrAdmin._id,
                    departmentId: depts[i % depts.length]._id,
                    teamId: teams[i % teams.length]._id,
                    projectId: task.projectId,
                    taskId: task._id,
                    employeeId: task.employeeId,
                    description: 'Reviewing the quality of execution and alignment with goals.',
                    dueDate: new Date('2026-07-01'),
                    taskDueDate: task.dueDate,
                    status: i % 4 === 0 ? 'Completed' : 'Pending',
                    employeeReview: i % 4 === 0 ? 'Work was delivered according to spec.' : undefined,
                    submissionDate: i % 4 === 0 ? new Date('2026-05-15') : undefined
                });
                await tr.save();
            }

            // Self Assessment
            const sa = new SelfAssessment({
                employeeId: task.employeeId,
                managerId: task.managerId,
                taskId: task._id,
                comments: 'I have successfully completed my assigned modules with high quality and within the deadline.',
                status: 'submitted'
            });
            await sa.save();
        }
        console.log('Reviews and Assessments populated.');

        console.log('\n--- LARGE SEEDING SUMMARY ---');
        console.log(`✅ HR ADMIN:    HR_Director / password123`);
        console.log(`✅ DEPARTMENTS: ${depts.length}`);
        console.log(`✅ MANAGERS:    ${managers.length}`);
        console.log(`✅ EMPLOYEES:   ${employees.length}`);
        console.log(`✅ TEAMS:       ${teams.length}`);
        console.log(`✅ GOALS:       ${goals.length} (2026 Datetime)`);
        console.log(`✅ TASKS:       ${tasks.length}`);
        console.log('\nAll login passwords are "password123"');
        console.log('------------------------------');

        console.log('Large seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedLarge();
