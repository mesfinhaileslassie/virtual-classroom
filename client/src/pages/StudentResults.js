import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../context/AssignmentContext';
import { classAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const StudentResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getMySubmissions, loading } = useAssignments();
  const [classes, setClasses] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [stats, setStats] = useState({
    totalAssignments: 0,
    submittedCount: 0,
    gradedCount: 0,
    averageGrade: 0,
    highestGrade: 0,
    lowestGrade: 100,
    totalPoints: 0,
    earnedPoints: 0
  });
  const [chartTab, setChartTab] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's enrolled classes
      const classesResponse = await classAPI.getClasses();
      setClasses(classesResponse.data.data || []);

      // Fetch all submissions
      const allResults = [];
      let totalStats = {
        totalAssignments: 0,
        submittedCount: 0,
        gradedCount: 0,
        sumGrades: 0,
        highestGrade: 0,
        lowestGrade: 100,
        totalPoints: 0,
        earnedPoints: 0
      };

      for (const classItem of classesResponse.data.data || []) {
        const submissionsResponse = await getMySubmissions(classItem._id);
        if (submissionsResponse.success) {
          const classResults = {
            classId: classItem._id,
            className: classItem.name,
            classCode: classItem.classCode,
            teacher: classItem.teacherId?.name,
            submissions: submissionsResponse.data || []
          };
          allResults.push(classResults);

          // Calculate statistics
          submissionsResponse.data.forEach(item => {
            totalStats.totalAssignments++;
            if (item.submission) {
              totalStats.submittedCount++;
              if (item.submission.grade !== undefined && item.submission.grade !== null) {
                totalStats.gradedCount++;
                totalStats.sumGrades += item.submission.grade;
                totalStats.earnedPoints += item.submission.grade;
                totalStats.highestGrade = Math.max(totalStats.highestGrade, item.submission.grade);
                totalStats.lowestGrade = Math.min(totalStats.lowestGrade, item.submission.grade);
              }
            }
            totalStats.totalPoints += item.totalPoints || 0;
          });
        }
      }

      setResults(allResults);
      
      setStats({
        totalAssignments: totalStats.totalAssignments,
        submittedCount: totalStats.submittedCount,
        gradedCount: totalStats.gradedCount,
        averageGrade: totalStats.gradedCount > 0 ? (totalStats.sumGrades / totalStats.gradedCount).toFixed(1) : 0,
        highestGrade: totalStats.highestGrade,
        lowestGrade: totalStats.lowestGrade === 100 ? 0 : totalStats.lowestGrade,
        totalPoints: totalStats.totalPoints,
        earnedPoints: totalStats.earnedPoints,
        percentage: totalStats.totalPoints > 0 
          ? ((totalStats.earnedPoints / totalStats.totalPoints) * 100).toFixed(1) 
          : 0
      });

    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const filteredResults = selectedClass === 'all' 
    ? results 
    : results.filter(r => r.classId === selectedClass);

  // Chart data for grade distribution
  const gradeDistributionData = {
    labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (Below 60)'],
    datasets: [
      {
        label: 'Number of Assignments',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)',
          'rgba(33, 150, 243, 0.6)',
          'rgba(255, 193, 7, 0.6)',
          'rgba(255, 152, 0, 0.6)',
          'rgba(244, 67, 54, 0.6)'
        ],
        borderColor: [
          '#4caf50',
          '#2196f3',
          '#ffc107',
          '#ff9800',
          '#f44336'
        ],
        borderWidth: 1
      }
    ]
  };

  // Calculate grade distribution from results
  results.forEach(classResult => {
    classResult.submissions.forEach(item => {
      if (item.submission?.grade) {
        const grade = item.submission.grade;
        const percentage = (grade / item.totalPoints) * 100;
        
        if (percentage >= 90) gradeDistributionData.datasets[0].data[0]++;
        else if (percentage >= 80) gradeDistributionData.datasets[0].data[1]++;
        else if (percentage >= 70) gradeDistributionData.datasets[0].data[2]++;
        else if (percentage >= 60) gradeDistributionData.datasets[0].data[3]++;
        else gradeDistributionData.datasets[0].data[4]++;
      }
    });
  });

  // Chart data for progress over time
  const progressData = {
    labels: results.flatMap(r => 
      r.submissions
        .filter(s => s.submission?.gradedAt)
        .map(s => new Date(s.submission.gradedAt).toLocaleDateString())
    ).slice(0, 10),
    datasets: [
      {
        label: 'Grade Trend',
        data: results.flatMap(r => 
          r.submissions
            .filter(s => s.submission?.grade)
            .map(s => (s.submission.grade / s.totalPoints) * 100)
        ).slice(0, 10),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4
      }
    ]
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'white' }}>
            <GradeIcon sx={{ fontSize: 40, color: '#1976d2' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              My Academic Results
            </Typography>
            <Typography variant="subtitle1">
              Track your performance across all classes
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Average Grade
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.averageGrade}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <GradeIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.averageGrade} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Assignments
                  </Typography>
                  <Typography variant="h4">
                    {stats.gradedCount}/{stats.totalAssignments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {stats.gradedCount} graded of {stats.totalAssignments} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Points Earned
                  </Typography>
                  <Typography variant="h4">
                    {stats.earnedPoints}/{stats.totalPoints}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {stats.percentage}% of total points
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Highest Grade
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.highestGrade}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Lowest: {stats.lowestGrade}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={chartTab} onChange={(e, v) => setChartTab(v)}>
            <Tab icon={<BarChartIcon />} label="Grade Distribution" />
            <Tab icon={<TrendingUpIcon />} label="Progress Trend" />
          </Tabs>
        </Box>

        {chartTab === 0 && (
          <Box sx={{ height: 300 }}>
            <Bar 
              data={gradeDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Grade Distribution'
                  }
                }
              }}
            />
          </Box>
        )}

        {chartTab === 1 && (
          <Box sx={{ height: 300 }}>
            <Line 
              data={progressData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Grade Progress Over Time'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Class Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6">Filter by Class:</Typography>
        <Chip
          label="All Classes"
          onClick={() => setSelectedClass('all')}
          color={selectedClass === 'all' ? 'primary' : 'default'}
          clickable
        />
        {classes.map(cls => (
          <Chip
            key={cls._id}
            label={cls.name}
            onClick={() => setSelectedClass(cls._id)}
            color={selectedClass === cls._id ? 'primary' : 'default'}
            clickable
          />
        ))}
      </Box>

      {/* Results by Class */}
      {filteredResults.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <GradeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete some assignments to see your results here.
          </Typography>
        </Paper>
      ) : (
        filteredResults.map((classResult) => (
          <Accordion key={classResult.classId} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SchoolIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{classResult.className}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {classResult.classCode} • Teacher: {classResult.teacher}
                  </Typography>
                </Box>
                <Chip 
                  label={`${classResult.submissions.filter(s => s.submission?.grade).length} graded`}
                  color="success"
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Assignment</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Feedback</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classResult.submissions.map((item) => (
                      <TableRow key={item.assignmentId}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {item.assignmentTitle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(item.dueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {item.submission ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CheckCircleIcon fontSize="small" color="success" />
                              <Typography variant="body2">
                                {new Date(item.submission.submittedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip label="Not submitted" size="small" color="warning" />
                          )}
                        </TableCell>
                        <TableCell>
                          {item.submission ? (
                            <Chip 
                              label={item.submission.status} 
                              size="small"
                              color={item.submission.status === 'graded' ? 'success' : 'info'}
                            />
                          ) : (
                            <Chip label="pending" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {item.submission?.grade !== undefined ? (
                            <Box>
                              <Typography variant="h6" color="primary">
                                {item.submission.grade}/{item.totalPoints}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {((item.submission.grade / item.totalPoints) * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.submission?.feedback ? (
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {item.submission.feedback}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No feedback yet
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/assignments/${item.assignmentId}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default StudentResults;