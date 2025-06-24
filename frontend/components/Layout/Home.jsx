import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Row,
  Col,
  Card,
  Space,
  Modal,
  Input,
  Select,
  Tag,
  Progress,
  Alert,
  Collapse,
  Form,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  SecurityScanOutlined,
  BulbOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  LinkOutlined,
  SendOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL = "https://ndimboni.ini.rw/api/scam-check";

const API_BASE_URL1 = "https://ndimboni.ini.rw/api/scammer-reports";

const CheckStatus = {
  SAFE: "SAFE",
  SUSPICIOUS: "SUSPICIOUS",
  MALICIOUS: "MALICIOUS",
  UNKNOWN: "UNKNOWN",
};

const IntentType = {
  LEGITIMATE: "LEGITIMATE",
  PHISHING: "PHISHING",
  ROMANCE_SCAM: "ROMANCE_SCAM",
  INVESTMENT_SCAM: "INVESTMENT_SCAM",
  LOTTERY_SCAM: "LOTTERY_SCAM",
  MONEY_REQUEST: "MONEY_REQUEST",
  UNKNOWN: "UNKNOWN",
};

const ScammerType = {
  EMAIL: "email",
  PHONE: "phone",
  SOCIAL_MEDIA: "social_media",
  WEBSITE: "website",
  OTHER: "other",
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [messageValue, setMessageValue] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [error, setError] = useState(null);

  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [checkaModalVisible, setCheckaModalVisible] = useState(false);
  const [isCheckingScammer, setIsCheckingScammer] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    type: "",
    identifier: "",
    description: "",
    additionalInfo: "",
    source: "web",
  });

  const [checkFormData, setCheckFormData] = useState({
    type: "",
    identifier: "",
  });

  const [reportForm] = Form.useForm();
  const [checkForm] = Form.useForm();

  const apiCalls = async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL1}${endpoint}`;

      const config = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      };

      if (
        options.body &&
        (config.method === "POST" || config.method === "PUT")
      ) {
        config.body = JSON.stringify(options.body);
      }

      console.log("API Call:", {
        url,
        method: config.method,
        headers: config.headers,
        body: config.body,
      });

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Call Error:", error);
      throw error;
    }
  };

  const submitReport = async (formData) => {
    setIsSubmittingReport(true);
    try {
      if (!formData.type || !formData.identifier || !formData.description) {
        message.error("Please fill in all required fields");
        return;
      }

      if (formData.description.length < 10) {
        message.error("Description must be at least 10 characters");
        return;
      }

      const requestData = {
        type: formData.type,
        identifier: formData.identifier.trim(),
        description: formData.description.trim(),
        additionalInfo: formData.additionalInfo
          ? formData.additionalInfo.trim()
          : undefined,
        source: formData.source || "web",
      };

      Object.keys(requestData).forEach((key) => {
        if (requestData[key] === undefined || requestData[key] === "") {
          delete requestData[key];
        }
      });

      console.log("Submitting report:", requestData);

      const response = await apiCalls("/report", {
        method: "POST",
        body: requestData,
      });

      if (response.success || response.data) {
        message.success("Scammer reported successfully");
        setReportModalVisible(false);
        setReportFormData({
          type: "",
          identifier: "",
          description: "",
          additionalInfo: "",
          source: "web",
        });
        reportForm.resetFields();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Submit report error:", error);
      message.error(`Failed to report scammer: ${error.message}`);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const checkScammer = async (formData) => {
    setIsCheckingScammer(true);
    try {
      if (!formData.type || !formData.identifier) {
        message.error("Please fill in all required fields");
        return;
      }

      const requestData = {
        type: formData.type,
        identifier: formData.identifier.trim(),
      };

      console.log("Checking scammer:", requestData);

      const response = await apiCalls("/check", {
        method: "POST",
        body: requestData,
      });

      if (response.success || response.data) {
        setCheckResult(response);
        message.success("Check completed");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Check scammer error:", error);
      message.error(`Failed to check scammer: ${error.message}`);
    } finally {
      setIsCheckingScammer(false);
    }
  };

  //scam Report end

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <SecurityScanOutlined className="text-3xl text-red-600" />,
      title: "AI-Powered Scam Detection",
      description:
        "Advanced machine learning algorithms using NLP and anomaly detection to identify fraudulent activities, phishing attempts, and fake investment schemes in real-time.",
    },
    {
      icon: <BulbOutlined className="text-3xl text-red-600" />,
      title: "Interactive Education Platform",
      description:
        "Engaging simulations and educational resources to raise awareness about digital scams, targeting youth, entrepreneurs, and the general public.",
    },
    {
      icon: <ExclamationCircleOutlined className="text-3xl text-red-600" />,
      title: "Centralized Reporting System",
      description:
        "Secure channel for reporting scam incidents with WhatsApp API integration, enabling better collaboration between citizens and authorities.",
    },
  ];

  const getStatusIcon = (status) => {
    const iconMap = {
      [CheckStatus.SAFE]: "✅",
      [CheckStatus.SUSPICIOUS]: "⚠️",
      [CheckStatus.MALICIOUS]: "❌",
      [CheckStatus.UNKNOWN]: "❓",
    };
    return iconMap[status] || "❓";
  };

  const getStatusColor = (status) => {
    const colors = {
      [CheckStatus.SAFE]: "green",
      [CheckStatus.SUSPICIOUS]: "orange",
      [CheckStatus.MALICIOUS]: "red",
      [CheckStatus.UNKNOWN]: "gray",
    };
    return colors[status] || "gray";
  };

  const getIntentColor = (intent) => {
    const colors = {
      [IntentType.LEGITIMATE]: "green",
      [IntentType.PHISHING]: "red",
      [IntentType.ROMANCE_SCAM]: "magenta",
      [IntentType.INVESTMENT_SCAM]: "orange",
      [IntentType.LOTTERY_SCAM]: "purple",
      [IntentType.MONEY_REQUEST]: "volcano",
      [IntentType.UNKNOWN]: "gray",
    };
    return colors[intent] || "gray";
  };

  const checkMessage = async (message) => {
    try {
      setCheckLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "X-User-Role": localStorage.getItem("user_role") || "user",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError(true);
          throw new Error("Unauthorized access. Please login again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Handle new backend response structure with comprehensive scan results
        const result = data.data.result || {};
        const scanResults = result.scanResults || {};
        const extractedIdentifiers = scanResults.extractedIdentifiers || {};
        const aiAnalysis = scanResults.aiAnalysis || {};
        const databaseMatches = scanResults.databaseMatches || {};
        const virusTotalResults = scanResults.virusTotalResults || {};
        const urlScanResults = scanResults.urlScanResults || {};
        const intentAnalysis = scanResults.intentAnalysis || {};

        const transformedResult = {
          id: data.data.id,
          message: scanResults.message || data.data.message,
          isScam: result.isScam || false,
          status: result.status || CheckStatus.UNKNOWN,
          intent: result.detectedIntent || IntentType.UNKNOWN,
          risk_score: parseFloat(result.riskScore || result.confidence || 0),
          confidence: parseFloat(result.confidence || 0),
          analysis: result.analysis || "Analysis completed successfully.",
          warning_flags: result.reasons || [],
          recommendations: result.recommendations || [],
          timestamp: data.data.createdAt || new Date().toISOString(),
          extracted_urls: scanResults.extractedUrls || [],
          detected_patterns: result.detectedPatterns || [],
          source: data.data.source || "web",
          
          // Comprehensive scan results
          extractedIdentifiers: {
            phones: extractedIdentifiers.phoneNumbers || [],
            emails: extractedIdentifiers.emails || [],
            urls: extractedIdentifiers.urls || [],
            cryptoAddresses: extractedIdentifiers.cryptoAddresses || [],
            socialHandles: extractedIdentifiers.socialMediaHandles || [],
          },
          aiAnalysis: {
            finalScore: aiAnalysis.finalScore || 0,
            intentScore: aiAnalysis.intentScore?.score || 0,
            recommendations: aiAnalysis.recommendations || [],
            reasoning: aiAnalysis.reasoning || "",
          },
          scammerDbMatches: {
            phoneMatches: databaseMatches.phoneMatches || [],
            emailMatches: databaseMatches.emailMatches || [],
            urlMatches: databaseMatches.urlMatches || [],
            totalMatches: (databaseMatches.phoneMatches?.length || 0) + 
                         (databaseMatches.emailMatches?.length || 0) + 
                         (databaseMatches.urlMatches?.length || 0),
          },
          virusTotalResults: {
            urlResults: virusTotalResults.details || [],
            safeUrls: virusTotalResults.safeUrls || 0,
            suspiciousUrls: virusTotalResults.suspiciousUrls || 0,
            maliciousUrls: virusTotalResults.maliciousUrls || 0,
          },
          urlScanResults: {
            results: urlScanResults.results || [],
            safeCount: urlScanResults.safeUrls || 0,
            suspiciousCount: urlScanResults.suspiciousUrls || 0,
            maliciousCount: urlScanResults.maliciousUrls || 0,
          },
          intentAnalysis: {
            confidence: intentAnalysis.confidence || 0,
            alternativeIntents: intentAnalysis.alternativeIntents || [],
            reasoningSteps: intentAnalysis.reasoningSteps || [],
            linguisticPatterns: intentAnalysis.linguisticPatterns || [],
          },
        };

        setCheckResult(transformedResult);
        setCheckModalVisible(false);
        setResultsModalVisible(true);
        setMessageValue("");
      } else {
        throw new Error(data.message || "Failed to check message");
      }
    } catch (error) {
      console.error("Message check error:", error);
      if (error.message.includes("Unauthorized")) {
        setAuthError(true);
      }
      setError(error.message || "Failed to check message. Please try again.");
    } finally {
      setCheckLoading(false);
    }
  };
  const handleCheckMessage = () => {
    if (!messageValue || messageValue.trim().length < 10) {
      setError("Please enter a message of at least 10 characters!");
      return;
    }
    checkMessage(messageValue.trim());
  };

  const handleOpenCheckModal = () => {
    setCheckModalVisible(true);
    setError(null);
    setMessageValue("");
  };

  const handleCloseCheckModal = () => {
    setCheckModalVisible(false);
    setError(null);
    setMessageValue("");
  };

  const handleCloseResultsModal = () => {
    setResultsModalVisible(false);
    setCheckResult(null);
  };
  const handleTelegramReport = () => {
    window.open("https://t.me/ndimboni_bot", "_blank");
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Function to handle opening the report scammer modal
  const handleOpenReportModal = () => {
    setReportFormData({
      type: "",
      identifier: "",
      description: "",
      additionalInfo: "",
      source: "web",
    });

    setReportModalVisible(true);
  };

  const handleOpenEducationPage = () => {
    window.location.href = "/education";
  };

  // Function to handle opening the check scammer modal
  const handleOpenScamModal = () => {
    setCheckFormData({
      type: "",
      identifier: "",
    });

    setCheckResult(null);

    setCheckaModalVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Hero Section */}
        <section className="bg-white text-dark py-20">
          <div className="container mx-auto px-0">
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Title
                    level={1}
                    className="mb-6"
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "bold",
                      color: "#2980B9",
                    }}
                  >
                    <span style={{ color: "#1A5276" }}>Ndimboni</span> - Combat
                    Digital Scams
                  </Title>
                  <Paragraph
                    className="text-base mb-8 leading-relaxed"
                    style={{ color: "#1A5276" }}
                  >
                    An AI-powered interactive web and mobile platform designed
                    to detect, report, and educate users about digital scams in
                    Rwanda. Protecting citizens from phishing, identity theft,
                    and fraudulent activities.
                  </Paragraph>
                  <Space size="large" className="flex flex-col sm:flex-row">
                    <Button
                      type="primary"
                      size="large"
                      icon={<GlobalOutlined />}
                      className="font-semibold px-8 py-3 h-auto"
                      style={{
                        background: "linear-gradient(135deg, #2980B9, #1A5276)",
                      }}
                      onClick={handleOpenCheckModal}
                    >
                      Check Scam Message
                    </Button>
                    <Button
                      type="default"
                      size="large"
                      icon={<SendOutlined />}
                      className="font-semibold px-8 py-3 h-auto"
                      onClick={handleTelegramReport}
                    >
                      Report via Telegram
                    </Button>
                  </Space>
                </motion.div>
              </Col>
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center max-w-6xl mx-auto"
                >
                  <div
                    className="rounded-2xl p-12"
                    style={{
                      backgroundColor: "#EBF5FB",
                      boxShadow: "0 4px 10px rgba(26, 82, 118, 0.2)",
                    }}
                  >
                    <h2
                      className="mb-8 text-3xl font-bold"
                      style={{ color: "#1A5276" }}
                    >
                      Project Impact
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mr-10">
                      {/* AI Detection Engine */}
                      <div className="text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          whileHover={{
                            scale: 1.05,
                            rotate: [0, -5, 5, -5, 0],
                            transition: { duration: 0.6 },
                          }}
                          className="inline-block mb-4 cursor-pointer"
                        >
                          <div
                            className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center p-4"
                            style={{
                              background:
                                "linear-gradient(135deg, #2980B9, #1A5276)",
                              boxShadow: "0 8px 32px rgba(26, 82, 118, 0.4)",
                            }}
                          >
                            <div className="text-white font-bold text-3xl mb-2">
                              AI
                            </div>
                            <div className="text-white text-sm font-medium opacity-90">
                              Engine
                            </div>
                          </div>
                        </motion.div>
                        <div
                          className="text-base font-semibold mt-2 ml-3"
                          style={{ color: "#1A5276" }}
                        >
                          AI Detection Engine
                        </div>
                      </div>

                      {/* Core Features */}
                      <div className="text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                          whileHover={{
                            scale: 1.05,
                            rotate: [0, 5, -5, 5, 0],
                            transition: { duration: 0.6 },
                          }}
                          className="inline-block mb-4 cursor-pointer"
                        >
                          <div
                            className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center p-4"
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "4px solid #2980B9",
                              boxShadow: "0 8px 32px rgba(26, 82, 118, 0.3)",
                            }}
                          >
                            <div
                              className="font-bold text-5xl mb-1"
                              style={{ color: "#2980B9" }}
                            >
                              3
                            </div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "#2980B9" }}
                            >
                              Features
                            </div>
                          </div>
                        </motion.div>
                        <div
                          className="text-base font-semibold mt-2 ml-3"
                          style={{ color: "#1A5276" }}
                        >
                          Core Features
                        </div>
                      </div>

                      {/* 24/7 Protection */}
                      <div className="text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          whileHover={{
                            scale: 1.05,
                            rotate: [0, -5, 5, -5, 0],
                            transition: { duration: 0.6 },
                          }}
                          className="inline-block mb-4 cursor-pointer"
                        >
                          <div
                            className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center p-4"
                            style={{
                              background:
                                "linear-gradient(135deg, #AED6F1, #2980B9)",
                              boxShadow: "0 8px 32px rgba(26, 82, 118, 0.4)",
                            }}
                          >
                            <div className="text-white font-bold text-2xl mb-1">
                              24/7
                            </div>
                            <div className="text-white text-sm font-medium opacity-90">
                              Active
                            </div>
                          </div>
                        </motion.div>
                        <div
                          className="text-base font-semibold mt-2 ml-3"
                          style={{ color: "#1A5276" }}
                        >
                          24/7 Protection
                        </div>
                      </div>

                      {/* Rwanda Localized */}
                      <div className="text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 1.0 }}
                          whileHover={{
                            scale: 1.05,
                            rotate: [0, 5, -5, 5, 0],
                            transition: { duration: 0.6 },
                          }}
                          className="inline-block mb-4 cursor-pointer"
                        >
                          <div
                            className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center p-4"
                            style={{
                              backgroundColor: "#AED6F1",
                              border: "4px solid #1A5276",
                              boxShadow: "0 8px 32px rgba(26, 82, 118, 0.3)",
                            }}
                          >
                            <div
                              className="font-bold text-3xl mb-1"
                              style={{ color: "#1A5276" }}
                            >
                              RW
                            </div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "#1A5276" }}
                            >
                              Local
                            </div>
                          </div>
                        </motion.div>
                        <div
                          className="text-base font-semibold mt-2 ml-3"
                          style={{ color: "#1A5276" }}
                        >
                          Rwanda Localized
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/*  Features Section */}
        <section className="py-5 bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#2980B9] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-[#1A5276] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#AED6F1] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-5"
            >
              <div className="inline-flex items-center px-4 py-2 bg-[#AED6F1] rounded-full text-[#1A5276] font-semibold text-sm mb-6">
                <span className="w-2 h-2 bg-[#2980B9] rounded-full mr-2 animate-pulse"></span>
                Platform Features
              </div>
              <Title
                level={3}
                className="text-4xl font-bold bg-gradient-to-r from-[#1A5276] to-[#2980B9] bg-clip-text text-transparent mb-6"
              >
                Revolutionizing Digital Safety
              </Title>
              <Paragraph className="text-lg text-[#1A5276] max-w-4xl mx-auto leading-relaxed opacity-90">
                Ndimboni combines cutting-edge artificial intelligence,
                comprehensive education, and community-driven reporting to
                create Rwanda's most advanced defense against digital scams.
              </Paragraph>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.3 },
                  }}
                  className="group cursor-pointer"
                >
                  <Card
                    className="h-full relative overflow-hidden border-0 transition-all duration-500 transform group-hover:scale-105"
                    style={{
                      borderRadius: "20px",
                      background: "#EBF5FB",
                      border: "1px solid rgba(174, 214, 241, 0.3)",
                      boxShadow: "0 4px 10px rgba(26, 82, 118, 0.2)",
                    }}
                  >
                    {/* Animated background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2980B9]/5 to-[#1A5276]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Floating particles effect */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-[#2980B9] rounded-full opacity-60 group-hover:animate-bounce"></div>
                    <div className="absolute top-6 right-6 w-1 h-1 bg-[#AED6F1] rounded-full opacity-60 group-hover:animate-bounce delay-100"></div>

                    <div className="relative z-10 p-0 text-center">
                      {/* Icon container with enhanced styling */}
                      <motion.div
                        className="relative mb-0 mx-auto w-10 h-10 flex items-center justify-center"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div
                          className="absolute inset-0 bg-[#FFFFFF] rounded-xl transition-all duration-300"
                          style={{
                            boxShadow: "0 3px 10px rgba(26, 82, 118, 0.3)",
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#AED6F1] to-[#EBF5FB] rounded-xl opacity-30"></div>
                        <div className="relative z-10 text-2xl">
                          {feature.icon}
                        </div>
                      </motion.div>

                      {/* Title with gradient text */}
                      <Title
                        level={4}
                        className="text-lg font-bold mb-3 bg-gradient-to-r from-[#1A5276] to-[#2980B9] bg-clip-text text-transparent group-hover:from-[#2980B9] group-hover:to-[#1A5276] transition-all duration-300"
                      >
                        {feature.title}
                      </Title>

                      {/* Description with enhanced typography */}
                      <Paragraph className="text-[#1A5276] leading-relaxed text-sm group-hover:opacity-90 transition-all duration-300 opacity-80 mb-0">
                        {feature.description}
                      </Paragraph>

                      {/* Subtle call-to-action indicator */}
                      <motion.div
                        className="mt-4 flex items-center justify-center text-[#2980B9] font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ y: 10 }}
                        whileHover={{ y: 0 }}
                        onClick={handleOpenEducationPage}
                      >
                        <span>Learn More</span>
                        <svg
                          className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2980B9] via-[#AED6F1] to-[#2980B9] opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-pulse"></div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-5"
            >
              <div
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#FFFFFF] rounded-full hover:bg-[#AED6F1] transition-all duration-300 cursor-pointer group"
                style={{ boxShadow: "0 4px 10px rgba(26, 82, 118, 0.2)" }}
                onClick={handleOpenEducationPage}
              >
                <span className="text-[#1A5276] font-medium group-hover:text-[#FFFFFF] transition-colors duration-200">
                  Ready to get started?
                </span>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="w-6 h-6 bg-[#2980B9] rounded-full flex items-center justify-center group-hover:bg-[#1A5276] transition-colors duration-200"
                >
                  <svg
                    className="w-3 h-3 text-[#FFFFFF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Research Team Section */}
        <section className="py-10" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card
                className="shadow-lg"
                style={{
                  borderRadius: "24px",
                  backgroundColor: "#EBF5FB",
                  border: "1px solid rgba(52, 152, 219, 0.1)",
                  padding: "0.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    background: "linear-gradient(180deg, #3498db, #2980b9)",
                  }}
                />

                <div className="text-center mb-12">
                  <Title
                    level={3}
                    className="text-lg font-bold mb-4"
                    style={{ color: "#2c3e50" }}
                  >
                    Development Team
                  </Title>
                  <Paragraph
                    className="text-base max-w-3xl mx-auto mb-12"
                    style={{ color: "#5d6d7e" }}
                  >
                    Ndimboni developed by Computer and Software Engineers under
                    expert supervision.
                  </Paragraph>
                </div>

                <Row gutter={[32, 32]} justify="center">
                  <Col xs={24} md={10}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.7)",
                          borderRadius: "12px",
                          padding: "1.5rem",
                          borderLeft: "3px solid #3498db",
                          transition: "all 0.3s ease",
                        }}
                        className="hover:shadow-md"
                      >
                        <UserOutlined
                          className="text-2xl mb-4"
                          style={{ color: "#3498db" }}
                        />
                        <Title
                          level={4}
                          className="mb-2"
                          style={{
                            color: "#2c3e50",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                          }}
                        >
                          MUNEZERO B.Sostene
                        </Title>
                        <Text
                          className="block mb-2"
                          style={{
                            color: "#2c3e50",
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          Backend Engineer
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginTop: "0.75rem",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: "0.9rem",
                              color: "#7f8c8d",
                              fontWeight: 500,
                            }}
                          >
                            Registration:
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Courier New, monospace",
                              fontWeight: 700,
                              color: "#2980b9",
                              backgroundColor: "rgba(52, 152, 219, 0.1)",
                              padding: "0.3rem 0.8rem",
                              borderRadius: "6px",
                            }}
                          >
                            221000677
                          </Text>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                  <Col xs={24} md={10}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.7)",
                          borderRadius: "12px",
                          padding: "1.5rem",
                          borderLeft: "3px solid #3498db",
                          transition: "all 0.3s ease",
                        }}
                        className="hover:shadow-md"
                      >
                        <UserOutlined
                          className="text-2xl mb-4"
                          style={{ color: "#3498db" }}
                        />
                        <Title
                          level={4}
                          className="mb-2"
                          style={{
                            color: "#2c3e50",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                          }}
                        >
                          DUSHIME Gabriel
                        </Title>
                        <Text
                          className="block mb-2"
                          style={{
                            color: "#2c3e50",
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          Frontend Engineer
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginTop: "0.75rem",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: "0.9rem",
                              color: "#7f8c8d",
                              fontWeight: 500,
                            }}
                          >
                            Registration:
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Courier New, monospace",
                              fontWeight: 700,
                              color: "#2980b9",
                              backgroundColor: "rgba(52, 152, 219, 0.1)",
                              padding: "0.3rem 0.8rem",
                              borderRadius: "6px",
                            }}
                          >
                            221016855
                          </Text>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section
          className="py-8"
          style={{
            background: "linear-gradient(135deg, #EBF5FB 0%, #3498DB 500%)",
          }}
        >
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-6xl mx-auto"
            >
              {/* Main CTA Content */}
              <div
                className="rounded-3xl p-8 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 50%, #FFFFFF 100%)",
                  border: "1px solid rgba(26, 82, 118, 0.1)",
                  boxShadow: "0 20px 60px rgba(26, 82, 118, 0.15)",
                }}
              >
                {/* Background Pattern */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(26, 82, 118, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, rgba(41, 128, 185, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 40% 80%, rgba(26, 82, 118, 0.1) 0%, transparent 50%)`,
                  }}
                />

                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Title
                      level={3}
                      className="text-base md:text-5xl font-bold mt-0 leading-tight"
                      style={{ color: "#1A5276" }}
                    >
                      Protect Yourself from
                      <span className=" ml-2">
                        <span style={{ color: "#2980B9" }}>Digital Scams</span>{" "}
                        Today
                      </span>
                    </Title>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <Paragraph
                      className="text-base mt-10 max-w-3xl mx-auto leading-relaxed"
                      style={{ color: "#1A5276" }}
                    >
                      Join thousands of Rwandans using{" "}
                      <span
                        className="font-semibold"
                        style={{ color: "#2980B9" }}
                      >
                        Ndimboni
                      </span>{" "}
                      to stay safe online. Report scams, learn protection
                      strategies, and contribute to a safer digital Rwanda.
                    </Paragraph>
                  </motion.div>

                  {/* Interactive Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div
                        className="text-4xl font-bold mb-2"
                        style={{ color: "#1A5276" }}
                      >
                        1000+
                      </div>
                      <div className="text-sm" style={{ color: "#2980B9" }}>
                        Protected Users
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div
                        className="text-4xl font-bold mb-2"
                        style={{ color: "#1A5276" }}
                      >
                        500+
                      </div>
                      <div className="text-sm" style={{ color: "#2980B9" }}>
                        Scams Detected
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div
                        className="text-4xl font-bold mb-2"
                        style={{ color: "#1A5276" }}
                      >
                        24/7
                      </div>
                      <div className="text-sm" style={{ color: "#2980B9" }}>
                        AI Protection
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <Space
                      size="large"
                      className="flex flex-col sm:flex-row justify-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          type="primary"
                          size="large"
                          icon={<ArrowRightOutlined />}
                          className="font-semibold px-10 py-4 h-auto text-lg rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, #2980B9, #1A5276)",
                            color: "#FFFFFF",
                            border: "none",
                            boxShadow: "0 8px 25px rgba(26, 82, 118, 0.3)",
                          }}
                          onClick={handleOpenReportModal}
                        >
                          Report a Scam
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          size="large"
                          className="font-semibold px-10 py-4 h-auto text-lg rounded-xl border-2 hover:bg-blue-600 hover:text-white transition-all duration-300"
                          style={{
                            backgroundColor: "transparent",
                            color: "#1A5276",
                            borderColor: "#2980B9",
                            boxShadow: "0 8px 25px rgba(26, 82, 118, 0.1)",
                          }}
                          onClick={handleOpenScamModal}
                        >
                          Check Scammer
                        </Button>
                      </motion.div>
                    </Space>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    viewport={{ once: true }}
                    className="mt-12 flex flex-wrap justify-center items-center gap-8"
                  >
                    <div
                      className="flex items-center text-sm"
                      style={{ color: "#1A5276" }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Rwanda Cyber Security Agency Approved
                    </div>
                    <div
                      className="flex items-center text-sm"
                      style={{ color: "#1A5276" }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      100% Free to Use
                    </div>
                    <div
                      className="flex items-center text-sm"
                      style={{ color: "#1A5276" }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Privacy Protected
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        <>
          {/* Message Check Modal */}
          <Modal
            title={
              <div className="text-center py-1">
                <SecurityScanOutlined
                  className="text-lg mr-2"
                  style={{ color: "#2980B9" }}
                />
                <span
                  className="text-lg font-semibold"
                  style={{ color: "#1A5276" }}
                >
                  Check Message for Scams
                </span>
              </div>
            }
            open={checkModalVisible}
            onCancel={handleCloseCheckModal}
            footer={null}
            centered
            width={480}
            className="scam-check-modal"
            styles={{
              content: {
                borderRadius: "12px",
                overflow: "hidden",
              },
            }}
          >
            <div className="p-3">
              <Paragraph
                className="text-sm mb-4 text-center"
                style={{ color: "#1A5276" }}
              >
                Paste suspicious message below for AI analysis
              </Paragraph>

              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  className="mb-3"
                  closable
                  onClose={() => setError(null)}
                  size="small"
                />
              )}

              <div className="mb-4">
                <TextArea
                  placeholder="Paste message here... (min 10 characters)"
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  rows={4}
                  className="rounded-lg"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.4",
                  }}
                />
                <div className="text-right mt-1">
                  <Text type="secondary" className="text-xs">
                    {messageValue.length} characters
                  </Text>
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <Button onClick={handleCloseCheckModal} className="px-4">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={checkLoading}
                  onClick={handleCheckMessage}
                  icon={<SendOutlined />}
                  className="px-4"
                  style={{
                    background: "linear-gradient(135deg, #2980B9, #1A5276)",
                    border: "none",
                    color: "#fff",
                    fontWeight: "500",
                  }}
                  disabled={!messageValue || messageValue.trim().length < 10}
                >
                  {checkLoading ? "Analyzing..." : "Check Message"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Results Modal*/}
          <Modal
            title={null}
            open={resultsModalVisible}
            onCancel={handleCloseResultsModal}
            footer={null}
            centered
            width={800}
            className="results-modal"
            styles={{
              content: {
                borderRadius: "12px",
                overflow: "hidden",
                padding: 0,
                maxHeight: "90vh",
              },
              body: {
                padding: 0,
                maxHeight: "80vh",
                overflowY: "auto",
              },
            }}
          >
            {checkResult && (
              <div>
                {/* Compact Header */}
                <div
                  className="p-4 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${
                      checkResult.isScam
                        ? "#f8d7da"
                        : checkResult.status === CheckStatus.SUSPICIOUS
                        ? "#fff3cd"
                        : checkResult.status === CheckStatus.SAFE
                        ? "#d4edda"
                        : "#e2e3e5"
                    }, #ffffff)`,
                  }}
                >
                  <div className="text-3xl mb-2">
                    {checkResult.isScam
                      ? "🚨"
                      : checkResult.status === CheckStatus.SAFE
                      ? "✅"
                      : checkResult.status === CheckStatus.SUSPICIOUS
                      ? "⚠️"
                      : "❓"}
                  </div>
                  <Title
                    level={4}
                    className="mb-1"
                    style={{
                      color: checkResult.isScam
                        ? "#721c24"
                        : checkResult.status === CheckStatus.SAFE
                        ? "#155724"
                        : checkResult.status === CheckStatus.SUSPICIOUS
                        ? "#856404"
                        : "#383d41",
                    }}
                  >
                    {checkResult.isScam
                      ? "Scam Detected!"
                      : "Analysis Complete"}
                  </Title>
                  <Text
                    style={{
                      color: checkResult.isScam
                        ? "#721c24"
                        : checkResult.status === CheckStatus.SAFE
                        ? "#155724"
                        : checkResult.status === CheckStatus.SUSPICIOUS
                        ? "#856404"
                        : "#383d41",
                    }}
                  >
                    {checkResult.isScam
                      ? "This message appears to be a scam"
                      : checkResult.status === CheckStatus.SAFE
                      ? "This message appears to be safe"
                      : "Analysis results available below"}
                  </Text>
                </div>

                {/* Modal Body */}
                <div className="p-4 space-y-4">
                  {/* Quick Summary */}
                  {checkResult.isScam && (
                    <Alert
                      message="⚠️ Scam Alert"
                      description="This message has been identified as a potential scam. Please do not respond to it or click any links."
                      type="error"
                      showIcon
                      className="mb-3"
                    />
                  )}

                  {!checkResult.isScam &&
                    checkResult.status === CheckStatus.SAFE && (
                      <Alert
                        message="✅ Message appears safe"
                        description="No scam indicators were detected in this message."
                        type="success"
                        showIcon
                        className="mb-3"
                      />
                    )}

                  {/* Status Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Text className="text-xs text-gray-600 block mb-1">
                        Scam Status
                      </Text>
                      <Tag
                        color={checkResult.isScam ? "red" : "green"}
                        className="text-xs"
                      >
                        {checkResult.isScam ? "SCAM" : "NOT SCAM"}
                      </Tag>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Text className="text-xs text-gray-600 block mb-1">
                        Safety Status
                      </Text>
                      <Tag
                        color={getStatusColor(
                          checkResult.status || CheckStatus.UNKNOWN
                        )}
                        className="text-xs"
                      >
                        {checkResult.status || CheckStatus.UNKNOWN}
                      </Tag>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Text className="text-xs text-gray-600 block mb-1">
                        Intent
                      </Text>
                      <Tag
                        color={getIntentColor(
                          checkResult.intent || IntentType.UNKNOWN
                        )}
                        className="text-xs"
                      >
                        {(checkResult.intent || IntentType.UNKNOWN).replace(
                          "_",
                          " "
                        )}
                      </Tag>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Text strong className="text-sm">
                        Risk Assessment
                      </Text>
                      <Text className="text-xs text-gray-600">
                        {((checkResult.risk_score || 0) * 100).toFixed(1)}%
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round((checkResult.risk_score || 0) * 100)}
                      size="small"
                      status={
                        (checkResult.risk_score || 0) < 0.3
                          ? "success"
                          : (checkResult.risk_score || 0) < 0.7
                          ? "normal"
                          : "exception"
                      }
                      strokeColor={
                        (checkResult.risk_score || 0) < 0.3
                          ? "#52c41a"
                          : (checkResult.risk_score || 0) < 0.7
                          ? "#faad14"
                          : "#ff4d4f"
                      }
                      showInfo={false}
                    />
                  </div>

                  {/* Comprehensive Analysis Sections */}
                  <Collapse
                    size="small"
                    className="bg-gray-50"
                    items={[
                      // Basic Analysis
                      {
                        key: "analysis",
                        label: (
                          <div className="flex items-center">
                            <SettingOutlined className="mr-2" />
                            <Text strong className="text-sm">
                              AI Analysis
                            </Text>
                          </div>
                        ),
                        children: (
                          <div className="space-y-3">
                            {checkResult.analysis && (
                              <div>
                                <Text strong className="text-xs block mb-1">Overview:</Text>
                                <Text className="text-xs leading-relaxed">
                                  {checkResult.analysis}
                                </Text>
                              </div>
                            )}
                            
                            {checkResult.aiAnalysis?.reasoning && (
                              <div>
                                <Text strong className="text-xs block mb-1">AI Reasoning:</Text>
                                <Text className="text-xs leading-relaxed">
                                  {checkResult.aiAnalysis.reasoning}
                                </Text>
                              </div>
                            )}

                            {checkResult.aiAnalysis?.finalScore !== undefined && (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-blue-50 rounded">
                                  <Text className="text-xs text-gray-600">AI Final Score</Text>
                                  <Text strong className="text-sm">
                                    {(checkResult.aiAnalysis.finalScore * 100).toFixed(1)}%
                                  </Text>
                                </div>
                                <div className="p-2 bg-purple-50 rounded">
                                  <Text className="text-xs text-gray-600">Intent Score</Text>
                                  <Text strong className="text-sm">
                                    {(checkResult.aiAnalysis.intentScore * 100).toFixed(1)}%
                                  </Text>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      },

                      // Extracted Identifiers
                      {
                        key: "identifiers",
                        label: (
                          <div className="flex items-center">
                            <DatabaseOutlined className="mr-2" />
                            <Text strong className="text-sm">
                              Extracted Information
                            </Text>
                            {(checkResult.extractedIdentifiers?.phones?.length > 0 ||
                              checkResult.extractedIdentifiers?.emails?.length > 0 ||
                              checkResult.extractedIdentifiers?.urls?.length > 0 ||
                              checkResult.extractedIdentifiers?.cryptoAddresses?.length > 0 ||
                              checkResult.extractedIdentifiers?.socialHandles?.length > 0) && (
                              <Tag color="blue" size="small" className="ml-2">
                                Found
                              </Tag>
                            )}
                          </div>
                        ),
                        children: (
                          <div className="space-y-3">
                            {checkResult.extractedIdentifiers?.phones?.length > 0 && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <PhoneOutlined className="text-blue-500 mr-2" />
                                  <Text strong className="text-xs">Phone Numbers ({checkResult.extractedIdentifiers.phones.length})</Text>
                                </div>
                                <div className="space-y-1">
                                  {checkResult.extractedIdentifiers.phones.map((phone, index) => (
                                    <Text key={index} className="text-xs block pl-4" code>
                                      {phone}
                                    </Text>
                                  ))}
                                </div>
                              </div>
                            )}

                            {checkResult.extractedIdentifiers?.emails?.length > 0 && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <MailOutlined className="text-green-500 mr-2" />
                                  <Text strong className="text-xs">Email Addresses ({checkResult.extractedIdentifiers.emails.length})</Text>
                                </div>
                                <div className="space-y-1">
                                  {checkResult.extractedIdentifiers.emails.map((email, index) => (
                                    <Text key={index} className="text-xs block pl-4" code>
                                      {email}
                                    </Text>
                                  ))}
                                </div>
                              </div>
                            )}

                            {checkResult.extractedIdentifiers?.urls?.length > 0 && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <LinkOutlined className="text-orange-500 mr-2" />
                                  <Text strong className="text-xs">URLs ({checkResult.extractedIdentifiers.urls.length})</Text>
                                </div>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                  {checkResult.extractedIdentifiers.urls.map((url, index) => (
                                    <Text key={index} className="text-xs block pl-4 break-all" code>
                                      {url.length > 50 ? url.substring(0, 50) + "..." : url}
                                    </Text>
                                  ))}
                                </div>
                              </div>
                            )}

                            {checkResult.extractedIdentifiers?.cryptoAddresses?.length > 0 && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <DollarOutlined className="text-yellow-500 mr-2" />
                                  <Text strong className="text-xs">Crypto Addresses ({checkResult.extractedIdentifiers.cryptoAddresses.length})</Text>
                                </div>
                                <div className="space-y-1">
                                  {checkResult.extractedIdentifiers.cryptoAddresses.map((address, index) => (
                                    <Text key={index} className="text-xs block pl-4 break-all" code>
                                      {address.length > 40 ? address.substring(0, 40) + "..." : address}
                                    </Text>
                                  ))}
                                </div>
                              </div>
                            )}

                            {checkResult.extractedIdentifiers?.socialHandles?.length > 0 && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <UserOutlined className="text-blue-400 mr-2" />
                                  <Text strong className="text-xs">Social Handles ({checkResult.extractedIdentifiers.socialHandles.length})</Text>
                                </div>
                                <div className="space-y-1">
                                  {checkResult.extractedIdentifiers.socialHandles.map((handle, index) => (
                                    <Text key={index} className="text-xs block pl-4" code>
                                      {handle}
                                    </Text>
                                  ))}
                                </div>
                              </div>
                            )}

                            {!(checkResult.extractedIdentifiers?.phones?.length > 0 ||
                              checkResult.extractedIdentifiers?.emails?.length > 0 ||
                              checkResult.extractedIdentifiers?.urls?.length > 0 ||
                              checkResult.extractedIdentifiers?.cryptoAddresses?.length > 0 ||
                              checkResult.extractedIdentifiers?.socialHandles?.length > 0) && (
                              <Text className="text-xs text-gray-500">
                                No identifiers extracted from the message.
                              </Text>
                            )}
                          </div>
                        ),
                      },

                      // Database Matches
                      {
                        key: "database",
                        label: (
                          <div className="flex items-center">
                            <SafetyOutlined className="mr-2" />
                            <Text strong className="text-sm">
                              Scammer Database Matches
                            </Text>
                            {checkResult.scammerDbMatches?.totalMatches > 0 && (
                              <Tag color="red" size="small" className="ml-2">
                                {checkResult.scammerDbMatches.totalMatches} Found
                              </Tag>
                            )}
                          </div>
                        ),
                        children: (
                          <div className="space-y-3">
                            {checkResult.scammerDbMatches?.totalMatches > 0 ? (
                              <>
                                {checkResult.scammerDbMatches.phoneMatches?.length > 0 && (
                                  <div className="p-2 bg-red-50 rounded">
                                    <Text strong className="text-xs text-red-800 block mb-1">
                                      Phone Number Matches ({checkResult.scammerDbMatches.phoneMatches.length})
                                    </Text>
                                    <div className="space-y-1">
                                      {checkResult.scammerDbMatches.phoneMatches.map((match, index) => (
                                        <div key={index} className="text-xs">
                                          <Text code>{match.identifier}</Text>
                                          <Text className="ml-2 text-gray-600">- {match.description || 'Known scammer'}</Text>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {checkResult.scammerDbMatches.emailMatches?.length > 0 && (
                                  <div className="p-2 bg-red-50 rounded">
                                    <Text strong className="text-xs text-red-800 block mb-1">
                                      Email Matches ({checkResult.scammerDbMatches.emailMatches.length})
                                    </Text>
                                    <div className="space-y-1">
                                      {checkResult.scammerDbMatches.emailMatches.map((match, index) => (
                                        <div key={index} className="text-xs">
                                          <Text code>{match.identifier}</Text>
                                          <Text className="ml-2 text-gray-600">- {match.description || 'Known scammer'}</Text>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {checkResult.scammerDbMatches.urlMatches?.length > 0 && (
                                  <div className="p-2 bg-red-50 rounded">
                                    <Text strong className="text-xs text-red-800 block mb-1">
                                      URL Matches ({checkResult.scammerDbMatches.urlMatches.length})
                                    </Text>
                                    <div className="space-y-1">
                                      {checkResult.scammerDbMatches.urlMatches.map((match, index) => (
                                        <div key={index} className="text-xs">
                                          <Text code className="break-all">
                                            {match.identifier.length > 40 ? match.identifier.substring(0, 40) + "..." : match.identifier}
                                          </Text>
                                          <Text className="ml-2 text-gray-600">- {match.description || 'Known malicious URL'}</Text>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <Text className="text-xs text-green-600">
                                ✅ No matches found in our scammer database.
                              </Text>
                            )}
                          </div>
                        ),
                      },

                      // URL Security Analysis
                      {
                        key: "urlSecurity",
                        label: (
                          <div className="flex items-center">
                            <EyeOutlined className="mr-2" />
                            <Text strong className="text-sm">
                              URL Security Analysis
                            </Text>
                            {(checkResult.virusTotalResults?.maliciousUrls > 0 ||
                              checkResult.urlScanResults?.maliciousCount > 0) && (
                              <Tag color="red" size="small" className="ml-2">
                                Threats Found
                              </Tag>
                            )}
                          </div>
                        ),
                        children: (
                          <div className="space-y-3">
                            {checkResult.virusTotalResults && (
                              <div>
                                <Text strong className="text-xs block mb-2">VirusTotal Results:</Text>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <Text className="text-xs text-green-800">Safe</Text>
                                    <Text strong className="block text-sm">{checkResult.virusTotalResults.safeUrls || 0}</Text>
                                  </div>
                                  <div className="text-center p-2 bg-yellow-50 rounded">
                                    <Text className="text-xs text-yellow-800">Suspicious</Text>
                                    <Text strong className="block text-sm">{checkResult.virusTotalResults.suspiciousUrls || 0}</Text>
                                  </div>
                                  <div className="text-center p-2 bg-red-50 rounded">
                                    <Text className="text-xs text-red-800">Malicious</Text>
                                    <Text strong className="block text-sm">{checkResult.virusTotalResults.maliciousUrls || 0}</Text>
                                  </div>
                                </div>

                                {checkResult.virusTotalResults.urlResults?.length > 0 && (
                                  <div className="mt-2 max-h-20 overflow-y-auto">
                                    {checkResult.virusTotalResults.urlResults.map((result, index) => (
                                      <div key={index} className="text-xs p-1 border-b">
                                        <Text code className="break-all">
                                          {result.url?.length > 40 ? result.url.substring(0, 40) + "..." : result.url}
                                        </Text>
                                        <Tag
                                          color={result.status === 'safe' ? 'green' : result.status === 'malicious' ? 'red' : 'orange'}
                                          size="small"
                                          className="ml-2"
                                        >
                                          {result.status}
                                        </Tag>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {checkResult.urlScanResults && (
                              <div>
                                <Text strong className="text-xs block mb-2">URL Scan Results:</Text>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <Text className="text-xs text-green-800">Safe</Text>
                                    <Text strong className="block text-sm">{checkResult.urlScanResults.safeCount || 0}</Text>
                                  </div>
                                  <div className="text-center p-2 bg-yellow-50 rounded">
                                    <Text className="text-xs text-yellow-800">Suspicious</Text>
                                    <Text strong className="block text-sm">{checkResult.urlScanResults.suspiciousCount || 0}</Text>
                                  </div>
                                  <div className="text-center p-2 bg-red-50 rounded">
                                    <Text className="text-xs text-red-800">Malicious</Text>
                                    <Text strong className="block text-sm">{checkResult.urlScanResults.maliciousCount || 0}</Text>
                                  </div>
                                </div>
                              </div>
                            )}

                            {!(checkResult.virusTotalResults?.urlResults?.length > 0 ||
                              checkResult.urlScanResults?.results?.length > 0) && (
                              <Text className="text-xs text-gray-500">
                                No URLs found for security analysis.
                              </Text>
                            )}
                          </div>
                        ),
                      },

                      // Intent Analysis
                      {
                        key: "intent",
                        label: (
                          <div className="flex items-center">
                            <InfoCircleOutlined className="mr-2" />
                            <Text strong className="text-sm">
                              Intent Analysis
                            </Text>
                            {checkResult.intentAnalysis?.confidence && (
                              <Tag color="blue" size="small" className="ml-2">
                                {(checkResult.intentAnalysis.confidence * 100).toFixed(0)}% confident
                              </Tag>
                            )}
                          </div>
                        ),
                        children: (
                          <div className="space-y-3">
                            {checkResult.intentAnalysis?.confidence !== undefined && (
                              <div className="p-2 bg-blue-50 rounded">
                                <Text strong className="text-xs block mb-1">Intent Confidence:</Text>
                                <Progress
                                  percent={Math.round(checkResult.intentAnalysis.confidence * 100)}
                                  size="small"
                                  strokeColor="#1890ff"
                                  showInfo={false}
                                />
                                <Text className="text-xs text-gray-600">
                                  {(checkResult.intentAnalysis.confidence * 100).toFixed(1)}% confident
                                </Text>
                              </div>
                            )}

                            {checkResult.intentAnalysis?.alternativeIntents?.length > 0 && (
                              <div>
                                <Text strong className="text-xs block mb-1">Alternative Intents:</Text>
                                <div className="flex flex-wrap gap-1">
                                  {checkResult.intentAnalysis.alternativeIntents.map((intent, index) => (
                                    <Tag key={index} color="geekblue" size="small">
                                      {intent.replace("_", " ")}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            )}

                            {checkResult.intentAnalysis?.reasoningSteps?.length > 0 && (
                              <div>
                                <Text strong className="text-xs block mb-1">Reasoning Steps:</Text>
                                <div className="space-y-1 max-h-16 overflow-y-auto">
                                  {checkResult.intentAnalysis.reasoningSteps.map((step, index) => (
                                    <Text key={index} className="text-xs block">
                                      {index + 1}. {step}
                                    </Text>
                                  ))}
                                </div>
                              </div>
                            )}

                            {checkResult.intentAnalysis?.linguisticPatterns?.length > 0 && (
                              <div>
                                <Text strong className="text-xs block mb-1">Linguistic Patterns:</Text>
                                <div className="flex flex-wrap gap-1">
                                  {checkResult.intentAnalysis.linguisticPatterns.map((pattern, index) => (
                                    <Tag key={index} color="purple" size="small">
                                      {pattern.replace("_", " ")}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      },

                      // Warning Flags & Patterns
                      {
                        key: "patterns",
                        label: (
                          <div className="flex items-center">
                            <ExclamationCircleOutlined className="mr-2" />
                            <Text strong className="text-sm">
                              Detection Details
                            </Text>
                            {(checkResult.warning_flags?.length > 0 || checkResult.detected_patterns?.length > 0) && (
                              <Tag color="orange" size="small" className="ml-2">
                                {(checkResult.warning_flags?.length || 0) + (checkResult.detected_patterns?.length || 0)} Items
                              </Tag>
                            )}
                          </div>
                        ),
                        children: (
                          <div className="space-y-3">
                            {checkResult.warning_flags?.length > 0 && (
                              <div className="p-2 bg-orange-50 rounded">
                                <Text strong className="text-xs text-orange-800 block mb-2">
                                  Warning Flags ({checkResult.warning_flags.length})
                                </Text>
                                <div className="space-y-1">
                                  {checkResult.warning_flags.map((flag, index) => (
                                    <div key={index} className="flex items-start text-xs">
                                      <ExclamationCircleOutlined className="text-orange-500 mr-2 text-xs mt-0.5 flex-shrink-0" />
                                      <Text className="text-xs leading-relaxed">{flag}</Text>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {checkResult.detected_patterns?.length > 0 && (
                              <div className="p-2 bg-blue-50 rounded">
                                <Text strong className="text-xs text-blue-800 block mb-2">
                                  Detected Patterns ({checkResult.detected_patterns.length})
                                </Text>
                                <div className="flex flex-wrap gap-1">
                                  {checkResult.detected_patterns.map((pattern, index) => (
                                    <Tag key={index} color="blue" size="small">
                                      {pattern.replace("_", " ")}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      },

                      // Recommendations
                      {
                        key: "recommendations",
                        label: (
                          <div className="flex items-center">
                            <CheckCircleOutlined className="mr-2" />
                            <Text strong className="text-sm">
                              Recommendations
                            </Text>
                          </div>
                        ),
                        children: (
                          <div className="space-y-2">
                            {checkResult.recommendations?.length > 0 ? (
                              <div className="space-y-2">
                                {checkResult.recommendations.map((rec, index) => (
                                  <div key={index} className="flex items-start">
                                    <CheckCircleOutlined className="text-green-500 mr-2 text-xs mt-0.5" />
                                    <Text className="text-xs leading-relaxed">{rec}</Text>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Text className="text-xs text-gray-500">
                                No specific recommendations available.
                              </Text>
                            )}

                            {checkResult.aiAnalysis?.recommendations?.length > 0 && (
                              <div className="mt-3 p-2 bg-green-50 rounded">
                                <Text strong className="text-xs text-green-800 block mb-1">
                                  AI Recommendations:
                                </Text>
                                <div className="space-y-1">
                                  {checkResult.aiAnalysis.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start">
                                      <CheckCircleOutlined className="text-green-500 mr-2 text-xs mt-0.5" />
                                      <Text className="text-xs leading-relaxed">{rec}</Text>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />

                  {/* Timestamp */}
                  {checkResult.timestamp && (
                    <div className="text-center pt-2 border-t border-gray-200">
                      <Text type="secondary" className="text-xs">
                        Analysis completed: {new Date(checkResult.timestamp).toLocaleString()}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 flex justify-center space-x-3 border-t border-gray-200 pt-3">
                  <Button
                    onClick={() => {
                      handleCloseResultsModal();
                      handleOpenCheckModal();
                    }}
                    icon={<SecurityScanOutlined />}
                    className="text-xs"
                  >
                    Check Another
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleCloseResultsModal}
                    style={{
                      background: "linear-gradient(135deg, #2980B9, #1A5276)",
                      border: "none",
                    }}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </>
      </div>

      {/* Report Scammer Modal  */}
      <Modal
        title="Report a Scammer"
        open={reportModalVisible}
        onCancel={() => {
          setReportModalVisible(false);
          setReportFormData({
            type: "",
            identifier: "",
            description: "",
            additionalInfo: "",
            source: "web",
          });
        }}
        footer={null}
        width={600}
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Scam Type *
            </label>
            <Select
              placeholder="Select scam type"
              style={{ width: "100%" }}
              value={reportFormData.type}
              onChange={(value) =>
                setReportFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <Option value={ScammerType.EMAIL}>Email</Option>
              <Option value={ScammerType.PHONE}>Phone</Option>
              <Option value={ScammerType.SOCIAL_MEDIA}>Social Media</Option>
              <Option value={ScammerType.WEBSITE}>Website</Option>
              <Option value={ScammerType.OTHER}>Other</Option>
            </Select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Contact Information *
            </label>
            <Input
              placeholder="Enter email, phone, username, or website"
              value={reportFormData.identifier}
              onChange={(e) =>
                setReportFormData((prev) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Description *
            </label>
            <TextArea
              rows={4}
              placeholder="Describe how this scammer tried to deceive you..."
              value={reportFormData.description}
              onChange={(e) =>
                setReportFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Additional Information
            </label>
            <TextArea
              rows={3}
              placeholder="Any additional details about this scammer..."
              value={reportFormData.additionalInfo}
              onChange={(e) =>
                setReportFormData((prev) => ({
                  ...prev,
                  additionalInfo: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setReportModalVisible(false);
                  setReportFormData({
                    type: "",
                    identifier: "",
                    description: "",
                    additionalInfo: "",
                    source: "web",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => submitReport(reportFormData)}
                loading={isSubmittingReport}
                disabled={isSubmittingReport}
              >
                Report Scammer
              </Button>
            </Space>
          </div>
        </div>
      </Modal>

      {/* Check Scammer Modal  */}
      <Modal
        title="Check if Scammer"
        open={checkaModalVisible}
        onCancel={() => {
          setCheckaModalVisible(false);
          setCheckResult(null);
          setCheckFormData({
            type: "",
            identifier: "",
          });
        }}
        footer={null}
        width={500}
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Type *
            </label>
            <Select
              placeholder="Select type to check"
              style={{ width: "100%" }}
              value={checkFormData.type}
              onChange={(value) =>
                setCheckFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <Option value={ScammerType.EMAIL}>Email</Option>
              <Option value={ScammerType.PHONE}>Phone</Option>
              <Option value={ScammerType.SOCIAL_MEDIA}>Social Media</Option>
              <Option value={ScammerType.WEBSITE}>Website</Option>
              <Option value={ScammerType.OTHER}>Other</Option>
            </Select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Contact Information *
            </label>
            <Input
              placeholder="Enter email, phone, username, or website to check"
              value={checkFormData.identifier}
              onChange={(e) =>
                setCheckFormData((prev) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "16px" }}>
            <Space>
              <Button
                onClick={() => {
                  setCheckaModalVisible(false);
                  setCheckResult(null);
                  setCheckFormData({
                    type: "",
                    identifier: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => checkScammer(checkFormData)}
                loading={isCheckingScammer}
              >
                Check Now
              </Button>
            </Space>
          </div>

          {checkResult && (
            <Alert
              message={
                checkResult.isScammer
                  ? "⚠️ Scammer Found!"
                  : "✅ No Scammer Record"
              }
              description={checkResult.message}
              type={checkResult.isScammer ? "error" : "success"}
              showIcon
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
