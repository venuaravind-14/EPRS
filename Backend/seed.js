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

dotenv.config();

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // 1. Clear all existing data
        await User.deleteMany({});
        await Department.deleteMany({});
        await Team.deleteMany({});
        await Goal.deleteMany({});
        await Task.deleteMany({});
        await TaskReview.deleteMany({});
        await SelfAssessment.deleteMany({});
        console.log('Cleared all previous data.');

        // 2. Hash passwords
        const commonPassword = await bcrypt.hash('test1234', 10);
        const hrPassword = await bcrypt.hash('testhr123', 10);
        const managerPassword = await bcrypt.hash('testmanager123', 10);
        const empPassword = await bcrypt.hash('test123', 10);

        // 3. Create HR User
        const hrUser = new User({
            username: 'TestHr',
            email: 'hradmin@revx.com',
            password: hrPassword,
            role: 'hr',
            hrDetails: {}
        });
        await hrUser.save();
        console.log('HR User created: TestHr');

        // 4. Create Departments
        const engineering = new Department({
            departmentName: 'Engineering',
            description: 'Core product development team',
            createdBy: hrUser._id
        });
        await engineering.save();

        const sales = new Department({
            departmentName: 'Sales',
            description: 'Revenue and growth team',
            createdBy: hrUser._id
        });
        await sales.save();
        console.log('Departments created: Engineering, Sales');

        // 5. Create Managers
        const engManager = new User({
            username: 'EngManager',
            email: 'eng_manager@revx.com',
            password: managerPassword,
            role: 'manager',
            managerDetails: { department: engineering._id }
        });
        await engManager.save();

        const salesManager = new User({
            username: 'SalesManager',
            email: 'sales_manager@revx.com',
            password: managerPassword,
            role: 'manager',
            managerDetails: { department: sales._id }
        });
        await salesManager.save();
        console.log('Managers created: EngManager, SalesManager');

        // 6. Create Employees
        const dev1 = new User({
            username: 'Test',
            email: 'dev1@revx.com',
            password: empPassword,
            role: 'employee',
            employeeDetails: {
                department: engineering._id,
                designation: 'Senior Developer',
                joiningDate: new Date('2023-01-01')
            }
        });
        await dev1.save();

        const dev2 = new User({
            username: 'DevJunior',
            email: 'dev2@revx.com',
            password: commonPassword,
            role: 'employee',
            employeeDetails: {
                department: engineering._id,
                designation: 'Junior Developer',
                joiningDate: new Date('2024-02-01')
            }
        });
        await dev2.save();

        const salesRep = new User({
            username: 'SalesRep1',
            email: 'sales1@revx.com',
            password: commonPassword,
            role: 'employee',
            employeeDetails: {
                department: sales._id,
                designation: 'Account Executive',
                joiningDate: new Date('2023-11-01')
            }
        });
        await salesRep.save();
        console.log('Employees created: Test (Dev), DevJunior, SalesRep1');

        // 7. Create Teams
        const engTeam = new Team({
            teamName: 'Frontend Squad',
            members: [engManager._id, dev1._id, dev2._id],
            createdBy: hrUser._id,
            departmentId: engineering._id
        });
        await engTeam.save();

        const salesTeam = new Team({
            teamName: 'Enterprise Sales',
            members: [salesManager._id, salesRep._id],
            createdBy: hrUser._id,
            departmentId: sales._id
        });
        await salesTeam.save();
        console.log('Teams created: Frontend Squad, Enterprise Sales');

        // 8. Create Projects
        const proj1 = new Goal({
            projectTitle: 'UI Overhaul',
            startDate: new Date('2024-03-01'),
            dueDate: new Date('2024-05-30'),
            status: 'in-progress',
            teamId: engTeam._id,
            managerId: engManager._id,
            description: 'Redesigning the entire dashboard to use Glassmorphism architecture.'
        });
        await proj1.save();

        const proj2 = new Goal({
            projectTitle: 'Q2 Sales Drive',
            startDate: new Date('2024-04-01'),
            dueDate: new Date('2024-06-30'),
            status: 'scheduled',
            teamId: salesTeam._id,
            managerId: salesManager._id,
            description: 'Closing 50 new enterprise accounts by end of Q2.'
        });
        await proj2.save();
        console.log('Projects created: UI Overhaul, Q2 Sales Drive');

        // 9. Create Tasks
        const tasks = [
            {
                projectId: proj1._id,
                taskTitle: 'Standardize CSS variables',
                status: 'completed',
                priority: 'high',
                employeeId: dev1._id,
                managerId: engManager._id,
                description: 'Refactor all hardcoded colors to global CSS tokens.',
                startDate: new Date('2024-03-05'),
                dueDate: new Date('2024-03-15')
            },
            {
                projectId: proj1._id,
                taskTitle: 'Implement Sidebar Layout',
                status: 'in-progress',
                priority: 'medium',
                employeeId: dev1._id,
                managerId: engManager._id,
                description: 'Develop the responsive glassmorphism sidebar for all roles.',
                startDate: new Date('2024-03-10'),
                dueDate: new Date('2024-04-20')
            },
            {
                projectId: proj1._id,
                taskTitle: 'Unit Test Components',
                status: 'scheduled',
                priority: 'low',
                employeeId: dev2._id,
                managerId: engManager._id,
                description: 'Write Jest/RTL tests for core UI components.',
                startDate: new Date('2024-04-25'),
                dueDate: new Date('2024-05-10')
            },
            {
                projectId: proj2._id,
                taskTitle: 'Lead Generation Campaign',
                status: 'in-progress',
                priority: 'high',
                employeeId: salesRep._id,
                managerId: salesManager._id,
                description: 'Reach out to 200 potential leads via LinkedIn.',
                startDate: new Date('2024-04-05'),
                dueDate: new Date('2024-05-05')
            }
        ];

        for (const t of tasks) {
            await new Task(t).save();
        }
        console.log('Multiple tasks assigned across teams.');

        // 10. Create Task Reviews
        const taskForReview = await Task.findOne({ taskTitle: 'Standardize CSS variables' });
        const tr1 = new TaskReview({
            hrAdminId: hrUser._id,
            departmentId: engineering._id,
            teamId: engTeam._id,
            projectId: proj1._id,
            taskId: taskForReview._id,
            employeeId: dev1._id,
            description: 'Please provide a detailed summary of the architectural changes in CSS.',
            dueDate: new Date('2024-05-15'),
            taskDueDate: taskForReview.dueDate,
            status: 'Pending'
        });
        await tr1.save();
        console.log('Task Review created for Test user.');

        // 11. Create a Self-Assessment
        const sa1 = new SelfAssessment({
            employeeId: dev1._id,
            managerId: engManager._id,
            taskId: taskForReview._id,
            comments: 'I successfully migrated over 500 lines of CSS to a centralized variable system. This improved maintainability by 40%.',
            status: 'submitted'
        });
        await sa1.save();
        console.log('Self-Assessment created for Test user.');

        // 12. Create another completed task for 'Test' user (to allow fresh self-assessment)
        const task2 = new Task({
            projectId: proj1._id,
            taskTitle: 'API Integration for Reports',
            status: 'completed',
            priority: 'high',
            employeeId: dev1._id,
            managerId: engManager._id,
            description: 'Connect the frontend charts to the new backend aggregation endpoints.',
            startDate: new Date('2024-03-20'),
            dueDate: new Date('2024-04-01'),
            updatedAt: new Date('2024-04-02')
        });
        await task2.save();
        console.log('Extra completed task created for Test user.');

        // 13. Create a Goal Review for HR (Pending)
        const GoalReview = require('./models/GoalReview');
        const gr1 = new GoalReview({
            hrAdminId: hrUser._id,
            managerId: engManager._id,
            teamId: engTeam._id,
            goalId: proj1._id,
            description: 'Evaluate the overall impact of the standardizing CSS project on team velocity.',
            dueDate: new Date('2024-06-01'),
            status: 'Pending'
        });
        await gr1.save();
        
        // 14. Create a COMPLETED Task Review for a different task
        const task3 = new Task({
            projectId: proj1._id,
            taskTitle: 'Database Migration',
            status: 'completed',
            priority: 'high',
            employeeId: dev1._id,
            managerId: engManager._id,
            description: 'Migrate legacy SQL data to MongoDB.',
            startDate: new Date('2024-02-15'),
            dueDate: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-02')
        });
        await task3.save();

        const tr2 = new TaskReview({
            hrAdminId: hrUser._id,
            departmentId: engineering._id,
            teamId: engTeam._id,
            projectId: proj1._id,
            taskId: task3._id,
            employeeId: dev1._id,
            description: 'Legacy code cleanup review',
            dueDate: new Date('2024-04-15'),
            taskDueDate: task3.dueDate,
            status: 'Completed',
            employeeReview: 'All legacy code removed successfully.',
            submissionDate: new Date('2024-04-10')
        });
        await tr2.save();
        console.log('Completed Task Review created.');

        console.log('\n--- Seeding Summary ---');
        console.log('✅ HR ADMIN:    TestHr / testhr123');
        console.log('✅ ENG MANAGER: EngManager / testmanager123');
        console.log('✅ SALES MGR:   SalesManager / testmanager123');
        console.log('✅ EMPLOYEE 1:  Test / test123 (Senior Dev)');
        console.log('✅ EMPLOYEE 2:  DevJunior / test1234');
        console.log('✅ EMPLOYEE 3:  SalesRep1 / test1234');
        console.log('\nSTRUCTURE:');
        console.log('- 2 Departments (Engineering, Sales)');
        console.log('- 2 Teams (Frontend Squad, Enterprise Sales)');
        console.log('- 2 Projects');
        console.log('- 4 Tasks');
        console.log('- 1 Task Review (Pending)');
        console.log('- 1 Self-Assessment (Submitted)');
        console.log('----------------------');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
