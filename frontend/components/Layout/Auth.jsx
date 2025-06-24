import { useState } from "react";
import { Typography, Button, Input, Card, Space, message, Form } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
  SecurityScanOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph, Text } = Typography;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const endpoint = isLogin
        ? "https://ndimboniapi.ini.rw/auth/login"
        : "https://ndimboniapi.ini.rw/auth/register";

      const payload = isLogin
        ? { email: values.email, password: values.password }
        : { email: values.email, password: values.password, name: values.name };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(
          isLogin ? "Login successful!" : "Registration successful!"
        );

        if (isLogin && data.access_token && data.user) {
          localStorage.setItem("access_token", data.access_token);

          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          };

          localStorage.setItem("user_email", data.user.email);
          localStorage.setItem("user_name", data.user.name);
          localStorage.setItem("user_role", data.user.role);

          localStorage.setItem("ndimboni_user", JSON.stringify(userData));

          console.log("User data stored successfully:", {
            token: data.access_token,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          });

          setTimeout(() => {
            if (data.user.role === "admin") {
              window.location.href = "/admin/dashboard";
            } else if (data.user.role === "moderator") {
              window.location.href = "/moderator/dashboard";
            } else {
              window.location.href = "/";
            }
          }, 1000);
        } else if (!isLogin && data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }

        form.resetFields();

        if (!isLogin) {
          setIsLogin(true);
          message.info("Please log in with your new account");
        }
      } else {
        message.error(
          data.message || `${isLogin ? "Login" : "Registration"} failed`
        );
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    form.resetFields();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1] flex items-center justify-center p-4 py-6 md:py-8 lg:py-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-48 h-48 bg-[#2980B9] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-20 right-10 w-60 h-60 bg-[#1A5276] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/3 w-52 h-52 bg-[#AED6F1] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10 mt-4 mb-4 md:mt-2 md:mb-2 lg:mt-0 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Left Side - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 mx-auto lg:mx-0"
                style={{
                  background: "linear-gradient(135deg, #2980B9, #1A5276)",
                  boxShadow: "0 6px 24px rgba(26, 82, 118, 0.4)",
                }}
              >
                <SecurityScanOutlined className="text-2xl text-white" />
              </motion.div>

              <Title
                level={1}
                className="text-xl lg:text-2xl font-bold mb-3"
                style={{ color: "#1A5276" }}
              >
                Welcome to <span style={{ color: "#2980B9" }}>Ndimboni</span>
              </Title>

              <Paragraph
                className="text-sm mb-3 leading-relaxed max-w-md mx-auto lg:mx-0"
                style={{ color: "#1A5276" }}
              >
                {isLogin
                  ? "Sign in to access your AI-powered scam protection dashboard and keep yourself safe from digital threats."
                  : "Join thousands of Rwandans protecting themselves from digital scams. Create your account today."}
              </Paragraph>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 mb-8">
              {[
                "AI-Powered Scam Detection",
                "Real-time Threat Alerts",
                "Community-Driven Reporting",
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-center lg:justify-start"
                >
                  <div className="w-1.5 h-1.5 bg-[#2980B9] rounded-full mr-2"></div>
                  <Text className="text-[#1A5276] font-medium text-sm">
                    {feature}
                  </Text>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-4 max-w-xs mx-auto lg:mx-0"
            >
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: "#1A5276" }}>
                  1000+
                </div>
                <div className="text-xs" style={{ color: "#2980B9" }}>
                  Protected Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: "#1A5276" }}>
                  500+
                </div>
                <div className="text-xs" style={{ color: "#2980B9" }}>
                  Scams Detected
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: "#1A5276" }}>
                  24/7
                </div>
                <div className="text-xs" style={{ color: "#2980B9" }}>
                  AI Protection
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card
              className="shadow-xl border-0"
              style={{
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 15px 40px rgba(26, 82, 118, 0.15)",
              }}
            >
              <div className="p-4">
                {/* Form Header */}
                <div className="text-center mb-6">
                  <Title
                    level={2}
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#1A5276" }}
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </Title>
                  <Text className="text-[#2980B9] text-sm">
                    {isLogin
                      ? "Welcome back to Ndimboni"
                      : "Join the digital protection community"}
                  </Text>
                </div>

                {/* Auth Form */}
                <Form
                  form={form}
                  onFinish={handleSubmit}
                  layout="vertical"
                  requiredMark={false}
                  className="space-y-4"
                >
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Form.Item
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your full name",
                          },
                          {
                            min: 2,
                            message: "Name must be at least 2 characters",
                          },
                        ]}
                        className="mb-3"
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#2980B9" }} />}
                          placeholder="Full Name"
                          className="rounded-lg border-2 py-2"
                          style={{ borderColor: "#AED6F1" }}
                          size="default"
                        />
                      </Form.Item>
                    </motion.div>
                  )}

                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your email address",
                      },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                    className="mb-3"
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "#2980B9" }} />}
                      placeholder="Email Address"
                      className="rounded-lg border-2 py-2"
                      style={{ borderColor: "#AED6F1" }}
                      size="default"
                      type="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "Please enter your password" },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters",
                      },
                    ]}
                    className="mb-3"
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#2980B9" }} />}
                      placeholder="Password"
                      className="rounded-lg border-2 py-2"
                      style={{ borderColor: "#AED6F1" }}
                      size="default"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  {isLogin && (
                    <div className="flex justify-end mb-3">
                      <Button
                        type="link"
                        className="p-0 text-sm text-[#2980B9] hover:text-[#1A5276]"
                      >
                        Forgot Password?
                      </Button>
                    </div>
                  )}

                  <Form.Item className="mb-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<ArrowRightOutlined />}
                        className="w-full font-semibold py-3 h-auto rounded-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, #2980B9, #1A5276)",
                          border: "none",
                          boxShadow: "0 6px 20px rgba(26, 82, 118, 0.25)",
                        }}
                      >
                        {loading
                          ? isLogin
                            ? "Signing In..."
                            : "Creating Account..."
                          : isLogin
                          ? "Sign In"
                          : "Create Account"}
                      </Button>
                    </motion.div>
                  </Form.Item>
                </Form>

                {/* Toggle Between Login/Register */}
                <div className="text-center pt-3 border-t border-[#AED6F1]">
                  <Text className="text-sm" style={{ color: "#1A5276" }}>
                    {isLogin
                      ? "Don't have an account? "
                      : "Already have an account? "}
                  </Text>
                  <Button
                    type="link"
                    onClick={toggleMode}
                    className="p-0 font-semibold text-sm text-[#2980B9] hover:text-[#1A5276]"
                  >
                    {isLogin ? "Create Account" : "Sign In"}
                  </Button>
                </div>

                {/* Security Notice */}
                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{ backgroundColor: "#EBF5FB" }}
                >
                  <div className="flex items-start">
                    <SecurityScanOutlined className="text-[#2980B9] mt-0.5 mr-2 text-sm" />
                    <div>
                      <Text
                        className="text-xs font-medium block mb-1"
                        style={{ color: "#1A5276" }}
                      >
                        Your Security Matters
                      </Text>
                      <Text className="text-xs" style={{ color: "#2980B9" }}>
                        We use advanced encryption to protect your data.
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
