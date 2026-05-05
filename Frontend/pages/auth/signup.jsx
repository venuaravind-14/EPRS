import React, { useState } from "react";
import Link from 'next/link';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  MenuItem,
  Grid
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  Work,
  Badge
} from "@mui/icons-material";
import { useRouter } from "next/router";
import axios from "axios";

const SignUp = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    designation: "",
    joiningDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'hr', label: 'HR Admin' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        employeeDetails: formData.role === 'employee' ? {
          designation: formData.designation,
          joiningDate: formData.joiningDate
        } : undefined,
        managerDetails: formData.role === 'manager' ? {} : undefined,
        hrDetails: formData.role === 'hr' ? {} : undefined
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, payload);

      setSnackbar({
        open: true,
        message: "Registration successful! Redirecting to login...",
        severity: "success"
      });

      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        py: 4,
        px: 2,
        background: "linear-gradient(135deg, #040B1A 0%, #0A1628 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Dynamic Background Elements matching landing page */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 188, 212, 0.1) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <Fade in timeout={800}>
        <Card
          sx={{
            maxWidth: 500,
            width: "100%",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
            borderRadius: 6,
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(10, 22, 40, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            zIndex: 1
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
              <Avatar
                sx={{
                  background: "linear-gradient(45deg, #0c4672, #00bcd4)",
                  width: 70,
                  height: 70,
                  mb: 2,
                  boxShadow: "0 8px 32px rgba(12, 70, 114, 0.4)"
                }}
              >
                <Badge sx={{ fontSize: '2rem', color: 'white' }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "800",
                  background: "linear-gradient(45deg, #ffffff, #00bcd4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1
                }}
              >
                Join RevX
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Start managing performance with AI-driven insights
              </Typography>
            </Box>

            <form onSubmit={handleSignUp}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Username"
                    name="username"
                    fullWidth
                    required
                    variant="outlined"
                    value={formData.username}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person sx={{ color: '#00bcd4' }} /></InputAdornment>,
                    }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    variant="outlined"
                    value={formData.email}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Email sx={{ color: '#00bcd4' }} /></InputAdornment>,
                    }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    required
                    variant="outlined"
                    value={formData.password}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#00bcd4' }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff sx={{ color: 'white' }} /> : <Visibility sx={{ color: 'white' }} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Role"
                    name="role"
                    fullWidth
                    value={formData.role}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Work sx={{ color: '#00bcd4' }} /></InputAdornment>,
                    }}
                    sx={inputStyle}
                  >
                    {roles.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {formData.role === 'employee' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="Designation"
                        name="designation"
                        fullWidth
                        variant="outlined"
                        value={formData.designation}
                        onChange={handleInputChange}
                        sx={inputStyle}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Joining Date"
                        name="joiningDate"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        sx={inputStyle}
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              {error && (
                <Fade in>
                  <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>{error}</Alert>
                </Fade>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 4,
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background: "linear-gradient(45deg, #0c4672, #00bcd4)",
                  boxShadow: "0 8px 32px rgba(12, 70, 114, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #0a3c5d, #00acc1)",
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                  Already have an account?{" "}
                  <Link href="/auth/signin" style={{ color: "#00bcd4", fontWeight: "bold", textDecoration: "none" }}>
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%", borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    borderRadius: 3,
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#00bcd4" }
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#00bcd4" },
  "& .MuiSelect-icon": { color: "white" }
};

export default SignUp;
