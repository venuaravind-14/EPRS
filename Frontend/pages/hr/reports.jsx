import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';
import HRLayout from "../../components/HRLayout";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  height: '100%',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
  color: 'white',
  borderRadius: 16,
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));

const StatBox = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: `${color}15`,
  border: `1px solid ${color}30`,
  '& .MuiAvatar-root': {
    backgroundColor: color,
    marginRight: theme.spacing(2),
  },
}));

const Reports = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTeams: 0,
    activeProjects: 0,
    completedTasks: 0,
    pendingReviews: 0
  });
  const [chartData, setChartData] = useState([]);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [last7Days, setLast7Days] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/hr");
    } else {
      fetchReportData();
    }
  }, [user, router]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Fetch data from various endpoints to aggregate
      const [usersRes, teamsRes, goalsRes, tasksRes, taskReviewsRes, goalReviewsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/hr`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews`, { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      const allReviews = [...taskReviewsRes.data, ...goalReviewsRes.data];

      setStats({
        totalEmployees: usersRes.data.filter(u => u.role === 'employee').length,
        totalTeams: teamsRes.data.length,
        activeProjects: goalsRes.data.filter(g => g.status === 'in-progress').length,
        completedTasks: tasksRes.data.filter(t => t.status === 'completed').length,
        pendingReviews: allReviews.filter(r => r.status === 'Pending').length
      });

      setTasks(tasksRes.data);
      setGoals(goalsRes.data);
      setReviews(allReviews);

      // Prepare Department distribution data
      const deptCounts = {};
      usersRes.data.forEach(u => {
        if (u.role === 'employee' || u.role === 'manager') {
          const dept = u.employeeDetails?.department?.departmentName || u.managerDetails?.department?.departmentName || 'Unknown';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        }
      });
      setChartData(Object.entries(deptCounts).map(([name, value]) => ({ name, value })));

      // Prepare Task Status data
      const statusCounts = {
        'Completed': tasksRes.data.filter(t => t.status === 'completed').length,
        'In Progress': tasksRes.data.filter(t => t.status === 'in-progress').length,
        'Scheduled': tasksRes.data.filter(t => t.status === 'scheduled').length
      };
      setTaskStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      // Process last 7 days trends
      const trends = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      }).map(date => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        const completedGoals = goalsRes.data.filter(g => 
          g.status === 'completed' && g.updatedAt && g.updatedAt.split('T')[0] === date
        ).length;
        const completedTasks = tasksRes.data.filter(t => 
          t.status === 'completed' && t.updatedAt && t.updatedAt.split('T')[0] === date
        ).length;
        return { day: dayName, goals: completedGoals, tasks: completedTasks };
      });
      setLast7Days(trends);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <HRLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#00bcd4' }} />
        </Box>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in timeout={800}>
          <Box>
            <HeaderCard>
              <Grid container alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    Advanced Analytics
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Performance insights and organizational data overview
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' }, mt: { xs: 2, md: 0 } }}>
                  <StatBox color="#ffffff">
                    <Avatar><TrendingUpIcon /></Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>System Status</Typography>
                      <Typography variant="h6">Operational</Typography>
                    </Box>
                  </StatBox>
                </Grid>
              </Grid>
            </HeaderCard>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'Total Employees', value: stats.totalEmployees, icon: <GroupIcon />, color: '#4caf50' },
                { label: 'Active Teams', value: stats.totalTeams, icon: <GroupIcon />, color: '#2196f3' },
                { label: 'Active Projects', value: stats.activeProjects, icon: <BarChartIcon />, color: '#ff9800' },
                { label: 'Completed Tasks', value: stats.completedTasks, icon: <AssignmentIcon />, color: '#9c27b0' }
              ].map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <StyledCard>
                    <CardContent>
                      <StatBox color={stat.color}>
                        <Avatar>{stat.icon}</Avatar>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                          <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                        </Box>
                      </StatBox>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ mr: 1, color: '#00bcd4' }} />
                      Employee Distribution by Department
                    </Typography>
                    <Box sx={{ height: 350, width: '100%' }}>
                      <ResponsiveContainer>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: 'rgba(0, 188, 212, 0.1)' }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
                      <PieChartIcon sx={{ mr: 1, color: '#00bcd4' }} />
                      Task Completion Status
                    </Typography>
                    <Box sx={{ height: 350, width: '100%', position: 'relative' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Performance Review Cycle Status
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemIcon><AssignmentIcon color="warning" /></ListItemIcon>
                        <ListItemText 
                          primary="Pending Reviews" 
                          secondary={`${stats.pendingReviews} cycles currently require action`} 
                        />
                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
                          {stats.pendingReviews}
                        </Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><TrendingUpIcon color="success" /></ListItemIcon>
                        <ListItemText 
                          primary="Review Completion Rate" 
                          secondary="Percentage of cycles finalized" 
                        />
                        <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                          {reviews.length > 0 ? Math.round((reviews.filter(r => r.status === 'Completed').length / reviews.length) * 100) : 0}%
                        </Typography>
                      </ListItem>
                    </List>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ mr: 1, color: '#00bcd4' }} />
                      Organizational Performance Trends
                    </Typography>
                    <Box sx={{ height: 350, width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart data={last7Days}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="goals" stroke="#4caf50" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Completed Goals" />
                          <Line type="monotone" dataKey="tasks" stroke="#2196f3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Completed Tasks" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </HRLayout>
  );
};

export default Reports;
