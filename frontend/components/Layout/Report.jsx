import { useState, useEffect } from 'react'
import { Typography, Button, Row,  Col, Card, Space, Modal, Input, Select,Tag, Progress, Alert, Collapse,Form,message } from 'antd'
import { 
  SearchOutlined,
  PhoneOutlined,
 SendOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  WhatsAppOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
const { TextArea } = Input
const { Title, Paragraph, Text } = Typography


const API_BASE_URL = 'https://ndimboniapi.ini.rw/api/scam-check'

const API_BASE_URL1 = 'https://ndimboniapi.ini.rw/api/scammer-reports';


const CheckStatus = {
  SAFE: 'SAFE',
  SUSPICIOUS: 'SUSPICIOUS',
  MALICIOUS: 'MALICIOUS',
  UNKNOWN: 'UNKNOWN'
}

const IntentType = {
  LEGITIMATE: 'LEGITIMATE',
  PHISHING: 'PHISHING',
  ROMANCE_SCAM: 'ROMANCE_SCAM',
  INVESTMENT_SCAM: 'INVESTMENT_SCAM',
  LOTTERY_SCAM: 'LOTTERY_SCAM',
  MONEY_REQUEST: 'MONEY_REQUEST',
  UNKNOWN: 'UNKNOWN'
}


const ScammerType = {
  EMAIL: 'email',
  PHONE: 'phone',
  SOCIAL_MEDIA: 'social_media',
  WEBSITE: 'website',
  OTHER: 'other'
};




export default function ReportPage() {
  const [mounted, setMounted] = useState(false)
  const [checkModalVisible, setCheckModalVisible] = useState(false)
  const [resultsModalVisible, setResultsModalVisible] = useState(false)
  const [messageValue, setMessageValue] = useState('')
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkResult, setCheckResult] = useState(null)
  const [error, setError] = useState(null)


   
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [checkaModalVisible, setCheckaModalVisible] = useState(false)
    const [isCheckingScammer, setIsCheckingScammer] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportFormData, setReportFormData] = useState({
    type: '',
    identifier: '',
    description: '',
    additionalInfo: '',
    source: 'web'
  });


  const [checkFormData, setCheckFormData] = useState({
    type: '',
    identifier: ''
  });

  const [reportForm] = Form.useForm();
  const [checkForm] = Form.useForm();


const apiCalls = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL1}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    if (options.body && (config.method === 'POST' || config.method === 'PUT')) {
      config.body = JSON.stringify(options.body);
    }

    console.log('API Call:', {
      url,
      method: config.method,
      headers: config.headers,
      body: config.body
    });

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

  const submitReport = async (formData) => {
    setIsSubmittingReport(true);
    try {
   
      if (!formData.type || !formData.identifier || !formData.description) {
        message.error('Please fill in all required fields');
        return;
      }

      if (formData.description.length < 10) {
        message.error('Description must be at least 10 characters');
        return;
      }

     
      const requestData = {
        type: formData.type,
        identifier: formData.identifier.trim(),
        description: formData.description.trim(),
        additionalInfo: formData.additionalInfo ? formData.additionalInfo.trim() : undefined,
        source: formData.source || 'web'
      };

      
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined || requestData[key] === '') {
          delete requestData[key];
        }
      });

      console.log('Submitting report:', requestData);

      const response = await apiCalls('/report', {
        method: 'POST',
        body: requestData
      });
      
      if (response.success || response.data) {
        message.success('Scammer reported successfully');
        setReportModalVisible(false);
        setReportFormData({
          type: '',
          identifier: '',
          description: '',
          additionalInfo: '',
          source: 'web'
        });
        reportForm.resetFields();
        
       
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Submit report error:', error);
      message.error(`Failed to report scammer: ${error.message}`);
    }
    finally {
    setIsSubmittingReport(false);
  }
  };

  const checkScammer = async (formData) => {
   setIsCheckingScammer(true);
    try {
      
      if (!formData.type || !formData.identifier) {
        message.error('Please fill in all required fields');
        return;
      }

      const requestData = {
        type: formData.type,
        identifier: formData.identifier.trim()
      };

      console.log('Checking scammer:', requestData);

      const response = await apiCalls('/check', {
        method: 'POST',
        body: requestData
      });
      
      if (response.success || response.data) {
        setCheckResult(response);
        message.success('Check completed');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Check scammer error:', error);
      message.error(`Failed to check scammer: ${error.message}`);
    }
     finally {
    setIsCheckingScammer(false);
  }
  };


  useEffect(() => {
    setMounted(true)
  }, [])

  const getStatusIcon = (status) => {
  const iconMap = {
    [CheckStatus.SAFE]: '✅',
    [CheckStatus.SUSPICIOUS]: '⚠️',
    [CheckStatus.MALICIOUS]: '❌',
    [CheckStatus.UNKNOWN]: '❓'
  };
  return iconMap[status] || '❓';
};

const getStatusColor = (status) => {
  const colors = {
    [CheckStatus.SAFE]: 'green',
    [CheckStatus.SUSPICIOUS]: 'orange', 
    [CheckStatus.MALICIOUS]: 'red',
    [CheckStatus.UNKNOWN]: 'gray'
  };
  return colors[status] || 'gray';
};

const getIntentColor = (intent) => {
  const colors = {
    [IntentType.LEGITIMATE]: 'green',
    [IntentType.PHISHING]: 'red',
    [IntentType.ROMANCE_SCAM]: 'magenta',
    [IntentType.INVESTMENT_SCAM]: 'orange',
    [IntentType.LOTTERY_SCAM]: 'purple',
    [IntentType.MONEY_REQUEST]: 'volcano',
    [IntentType.UNKNOWN]: 'gray'
  };
  return colors[intent] || 'gray';
};

 
 const checkMessage = async (message) => {
  try {
    setCheckLoading(true);
    setError(null);

    const response = await fetch(`${API_BASE_URL}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'X-User-Role': localStorage.getItem('user_role') || 'user'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      if (response.status === 401) {
        setAuthError(true);
        throw new Error('Unauthorized access. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
     
      const transformedResult = {
        status: data.data.status || CheckStatus.UNKNOWN,
        intent: data.data.detectedIntent || IntentType.UNKNOWN,
        risk_score: data.data.riskScore || 0,
        analysis: data.data.analysis || 'Analysis completed successfully.',
        warning_flags: data.data.reasons || [],
        recommendations: data.data.recommendations || [],
        timestamp: new Date().toISOString(),
        extracted_urls: data.data.extractedUrls || [],
        confidence: data.data.confidence || 0,
        detected_patterns: data.data.detectedPatterns || []
      };

      setCheckResult(transformedResult);
      setCheckModalVisible(false);
      setResultsModalVisible(true);
      setMessageValue('');
      
     
      fetchChecks();
      fetchStats();
    } else {
      throw new Error(data.message || 'Failed to check message');
    }
  } catch (error) {
    console.error('Message check error:', error);
    if (error.message.includes('Unauthorized')) {
      setAuthError(true);
    }
    setError(error.message || 'Failed to check message. Please try again.');
  } finally {
    setCheckLoading(false);
  }
};
const handleCheckMessage = () => {
  if (!messageValue || messageValue.trim().length < 10) {
    setError('Please enter a message of at least 10 characters!');
    return;
  }
  checkMessage(messageValue.trim());
};

const handleOpenCheckModal = () => {
  setCheckModalVisible(true);
  setError(null);
  setMessageValue('');
};

const handleCloseCheckModal = () => {
  setCheckModalVisible(false);
  setError(null);
  setMessageValue('');
};

const handleCloseResultsModal = () => {
  setResultsModalVisible(false);
  setCheckResult(null);
};
const handleTelegramReport = () => {
  window.open('https://t.me/ndimboni_bot', '_blank');
};

const handleWhatsAppReport = () => {
  window.open('http://wa.me/250784743039', '_blank');
};

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }


  

const handleOpenReportModal = () => {

  setReportFormData({
    type: '',
    identifier: '',
    description: '',
    additionalInfo: '',
    source: 'web'
  });
  

  setReportModalVisible(true);
};



const handleOpenScamModal = () => {
  
  setCheckFormData({
    type: '',
    identifier: ''
  });
  

  setCheckResult(null);
  
 
  setCheckaModalVisible(true);
};


const reportCards = [
{
  icon: <CheckCircleOutlined className="text-4xl" style={{ color: '#e74c3c' }} />,
  title: 'Check Scam Message',
  description: 'Verify suspicious messages, emails, or links using our AI-powered detection tool before interacting with them.',
  details: 'Our intelligent scam detection system analyzes message content, sender information, links, and patterns to help you identify phishing emails, fake text messages, suspicious social media contacts, and fraudulent websites. Get instant feedback on whether a message is legitimate or potentially dangerous.',
  buttonText: 'Check Message Now',
  buttonIcon: <GlobalOutlined />,
  gradient: 'from-blue-500 to-blue-600',
  bgColor: '#e3f2fd',
  handler: () => {
    handleOpenCheckModal();  
  }
},
 {
    icon: <ArrowRightOutlined className="text-4xl" style={{ color: '#2980B9' }} />,
    title: 'Report a Scam',
    description: 'Encountered any type of fraudulent activity or suspicious behavior? Use our comprehensive reporting system to document and report various types of scams including online fraud, phone scams, email phishing, and more.',
    details: 'Our unified reporting platform allows you to quickly submit detailed information about any scam encounter. Provide screenshots, messages, contact details, and incident descriptions to help our team investigate and warn others about emerging threats.',
    buttonText: 'Report a Scam',
    buttonIcon: <ArrowRightOutlined />,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: '#e3f2fd',
    handler: () => {
      handleOpenReportModal();
    }
  },
{
  icon: <MessageOutlined className="text-4xl" style={{ color: '#25D366' }} />,
  title: 'Report via WhatsApp',
  description: 'Quickly report scams, fraudulent activities, or suspicious content directly through our WhatsApp channel. Get fast community support and connect with other users who can help verify threats.',
  details: 'Our WhatsApp reporting system allows you to instantly share suspicious messages, and scam details with our verification team and community. Receive real-time feedback and warnings about emerging scam patterns from other users.',
  buttonText: 'Report via WhatsApp',
  buttonIcon: <MessageOutlined />,
  gradient: 'from-green-500 to-green-600',
  bgColor: '#e8f5e8',
  handler: () => {
    handleWhatsAppReport();
  }
},
  {
    icon: <SendOutlined className="text-4xl" style={{ color: '#0088cc' }} />,
    title: 'Report via Telegram',
    description: 'Quickly report scams, fraudulent activities, or suspicious content directly through our Telegram channel. Get fast community support and connect with other users who can help verify threats.',
    details: 'Our Telegram reporting system allows you to instantly share suspicious messages, and scam details with our verification team and community. Receive real-time feedback and warnings about emerging scam patterns from other users.',
    buttonText: 'Report via Telegram',
    buttonIcon: <SendOutlined />,
    gradient: 'from-blue-400 to-blue-500',
    bgColor: '#e3f2fd',
    handler: () => {
      handleTelegramReport();
    }
  },
 
  {
    icon: <SearchOutlined className="text-4xl" style={{ color: '#2980b9' }} />,
    title: 'Check Scammer',
    description: 'Verify if someone contacting you is a known scammer or fraudster. Search our database of reported scammers using phone numbers, email addresses, usernames, or other identifying information.',
    details: 'Our scammer verification system maintains a comprehensive database of known fraudsters and their contact methods. Check suspicious profiles, phone numbers, and accounts before engaging to protect yourself from potential scams.',
    buttonText: 'Check Scammer',
    buttonIcon: <SearchOutlined />,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: '#e3f2fd',
    handler: () => {
     handleOpenScamModal();
    }
  },
  
 
]

const handleEmergencyCall = () => {
 
  window.location.href = 'tel:250783447260';
};

const handleWhatsAppSupport = () => {
 
  const whatsappNumber = '+250784310609'; 
  const message = 'Hello, I need help with a scam issue.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

const handleCyberCrimeUnit = () => {

  window.location.href = 'tel:+250783447260';  
  
};

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Hero Section */}
        <section className="bg-white text-dark py-4">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <Title level={1} className="mb-6" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2980B9' }}>
                Report <span style={{ color: '#1A5276' }}>Digital Scams</span>
              </Title>
              <Paragraph className="text-lg mb-8 leading-relaxed max-w-4xl mx-auto" style={{ color: '#1A5276' }}>
                Help protect the Rwandan digital community by reporting scams and fraudulent activities. 
                Your reports help us improve our AI detection systems and warn others about emerging threats. 
                All reports are handled confidentially and contribute to building a safer digital environment for everyone.
              </Paragraph>
              
              <div 
                className="rounded-2xl p-6 max-w-2xl mx-auto"
                style={{
                  backgroundColor: '#EBF5FB',
                  boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                }}
              >
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: '#1A5276' }}>24/7</div>
                    <div className="text-sm" style={{ color: '#2980B9' }}>Reporting Available</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: '#1A5276' }}>100%</div>
                    <div className="text-sm" style={{ color: '#2980B9' }}>Confidential</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: '#1A5276' }}>AI</div>
                    <div className="text-sm" style={{ color: '#2980B9' }}>Enhanced Detection</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
       {/* Report Cards Section */}
        <section className="py-4" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Title level={2} className="text-lg font-bold mb-6" style={{ color: '#1A5276' }}>
                Choose Report Type
              </Title>
              <Paragraph className="text-lg max-w-3xl mx-auto" style={{ color: '#1A5276' }}>
                Select the type of scam or fraudulent activity you want to report. Each category helps us better understand and combat specific threats.
              </Paragraph>
            </motion.div>

            <Row gutter={[32, 32]}>
              {reportCards.map((card, index) => (
                <Col xs={24} lg={12} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <Card
                      className="h-full"
                      style={{
                        borderRadius: '20px',
                        backgroundColor: card.bgColor,
                        border: '1px solid rgba(174, 214, 241, 0.3)',
                        boxShadow: '0 6px 20px rgba(26, 82, 118, 0.15)'
                      }}
                    >
                      <div className="text-center mb-6">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                          className="mb-4"
                        >
                          {card.icon}
                        </motion.div>
                        <Title level={3} className="mb-4" style={{ color: '#1A5276' }}>
                          {card.title}
                        </Title>
                      </div>

                      <div className="mb-6">
                        <Paragraph className="text-base leading-relaxed mb-4" style={{ color: '#1A5276' }}>
                          {card.description}
                        </Paragraph>
                        <Paragraph className="text-sm leading-relaxed" style={{ color: '#5D6D7E' }}>
                          {card.details}
                        </Paragraph>
                      </div>

                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="primary"
                            size="large"
                            icon={card.buttonIcon}
                            className="font-semibold px-8 py-3 h-auto w-full"
                            style={{ 
                              background:'linear-gradient(135deg, #2980B9, #1A5276)',
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                            onClick={card.handler}
                          >
                            {card.buttonText}
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>
        {/* Emergency Contact Section */}
<section className="py-6 bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1]">
  <div className="container mx-auto px-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <Title level={2} className="text-lg font-bold mb-6" style={{ color: '#1A5276' }}>
        Need Immediate Help?
      </Title>
      <Paragraph className="text-sm mb-8 max-w-2xl mx-auto" style={{ color: '#1A5276' }}>
        If you're currently being targeted by a scam or have already been victimized, 
        contact the authorities immediately or reach out to our emergency support channels.
      </Paragraph>
      
      <Space size="large" className="flex flex-col sm:flex-row justify-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="primary"
            size="large"
            icon={<PhoneOutlined />}
            className="font-semibold px-8 py-3 h-auto"
            style={{ 
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              border: 'none',
              borderRadius: '12px'
            }}
            onClick={handleEmergencyCall}
          >
            Deal +250783447260
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="default"
            size="large"
            icon={<WhatsAppOutlined />}
            className="font-semibold px-8 py-3 h-auto"
            style={{ 
              backgroundColor: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '12px'
            }}
            onClick={handleWhatsAppSupport}
          >
            WhatsApp Support
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="default"
            size="large"
            icon={<SafetyOutlined />}
            className="font-semibold px-8 py-3 h-auto"
            style={{ 
              backgroundColor: '#2980B9',
              color: 'white',
              border: 'none',
              borderRadius: '12px'
            }}
            onClick={handleCyberCrimeUnit}
          >
            Cyber Crime Unit
          </Button>
        </motion.div>
      </Space>
    </motion.div>
  </div>
</section>
        <>
          {/* Message Check Modal */}
          <Modal
            title={
              <div className="text-center py-1">
                <SecurityScanOutlined className="text-lg mr-2" style={{ color: '#2980B9' }} />
                <span className="text-lg font-semibold" style={{ color: '#1A5276' }}>
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
                borderRadius: '12px',
                overflow: 'hidden'
              }
            }}
          >
            <div className="p-3">
              <Paragraph className="text-sm mb-4 text-center" style={{ color: '#1A5276' }}>
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
                    fontSize: '13px',
                    lineHeight: '1.4'
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
                    background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                    border: 'none',
                    color:'#fff',
                    fontWeight:'500'
                  }}
                  disabled={!messageValue || messageValue.trim().length < 10}
                >
                  {checkLoading ? 'Analyzing...' : 'Check Message'}
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
            width={600}
            className="results-modal"
            styles={{
              content: {
                borderRadius: '12px',
                overflow: 'hidden',
                padding: 0,
                maxHeight: '85vh'
              },
              body: {
                padding: 0,
                maxHeight: '75vh',
                overflowY: 'auto'
              }
            }}
          >
            {checkResult && (
              <div>
                {/* Compact Header */}
                <div
                  className="p-4 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${
                      checkResult.status === CheckStatus.SAFE ? '#d4edda' :
                      checkResult.status === CheckStatus.SUSPICIOUS ? '#fff3cd' :
                      checkResult.status === CheckStatus.MALICIOUS ? '#f8d7da' : '#e2e3e5'
                    }, #ffffff)`
                  }}
                >
                  <div className="text-3xl mb-2">
                    {getStatusIcon(checkResult.status || CheckStatus.UNKNOWN)}
                  </div>
                  <Title
                    level={4}
                    className="mb-1"
                    style={{
                      color:
                        (checkResult.status || CheckStatus.UNKNOWN) === CheckStatus.SAFE
                          ? '#155724'
                          : (checkResult.status || CheckStatus.UNKNOWN) === CheckStatus.SUSPICIOUS
                          ? '#856404'
                          : (checkResult.status || CheckStatus.UNKNOWN) === CheckStatus.MALICIOUS
                          ? '#721c24'
                          : '#383d41'
                    }}
                  >
                    Analysis Complete
                  </Title>
                </div>
        
                {/* Modal Body */}
                <div className="p-4 space-y-3">
                  {/* Status Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Text className="text-xs text-gray-600 block mb-1">Status</Text>
                      <Tag color={getStatusColor(checkResult.status || CheckStatus.UNKNOWN)} className="text-xs">
                        {checkResult.status || CheckStatus.UNKNOWN}
                      </Tag>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Text className="text-xs text-gray-600 block mb-1">Intent</Text>
                      <Tag color={getIntentColor(checkResult.intent || IntentType.UNKNOWN)} className="text-xs">
                        {(checkResult.intent || IntentType.UNKNOWN).replace('_', ' ')}
                      </Tag>
                    </div>
                  </div>
        
                  {/* Risk Score */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Text strong className="text-sm">Risk Assessment</Text>
                      <Text className="text-xs text-gray-600">
                        {((checkResult.risk_score || 0) * 100).toFixed(1)}%
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round((checkResult.risk_score || 0) * 100)}
                      size="small"
                      status={
                        (checkResult.risk_score || 0) < 0.3 ? 'success' :
                        (checkResult.risk_score || 0) < 0.7 ? 'normal' : 'exception'
                      }
                      strokeColor={
                        (checkResult.risk_score || 0) < 0.3 ? '#52c41a' :
                        (checkResult.risk_score || 0) < 0.7 ? '#faad14' : '#ff4d4f'
                      }
                      showInfo={false}
                    />
                  </div>
        
                  {/* Confidence Score */}
                  {checkResult.confidence !== undefined && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <Text strong className="text-sm">Confidence</Text>
                        <Text className="text-xs text-gray-600">
                          {((checkResult.confidence || 0) * 100).toFixed(1)}%
                        </Text>
                      </div>
                      <Progress
                        percent={Math.round((checkResult.confidence || 0) * 100)}
                        size="small"
                        strokeColor="#1890ff"
                        showInfo={false}
                      />
                    </div>
                  )}
        
                  {/* Detailed Analysis */}
                  {checkResult.analysis && (
                    <Collapse
                      size="small"
                      className="bg-gray-50"
                      items={[{
                        key: 'analysis',
                        label: <Text strong className="text-sm">Detailed Analysis</Text>,
                        children: <Text className="text-xs leading-relaxed">{checkResult.analysis}</Text>
                      }]}
                    />
                  )}
        
                  {/* Warning Flags */}
                  {checkResult.warning_flags?.length > 0 && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <Text strong className="text-sm text-orange-800 block mb-2">
                        Warning Flags ({checkResult.warning_flags.length})
                      </Text>
                      <div className="space-y-1">
                        {checkResult.warning_flags.slice(0, 3).map((flag, index) => (
                          <div key={index} className="flex items-center text-xs">
                            <ExclamationCircleOutlined className="text-orange-500 mr-2 text-xs" />
                            <Text className="text-xs">{flag.replace('_', ' ')}</Text>
                          </div>
                        ))}
                        {checkResult.warning_flags.length > 3 && (
                          <Text className="text-xs text-gray-600">
                            +{checkResult.warning_flags.length - 3} more...
                          </Text>
                        )}
                      </div>
                    </div>
                  )}
        
                  {/* Detected Patterns */}
                  {checkResult.detected_patterns?.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Text strong className="text-sm text-blue-800 block mb-2">
                        Detected Patterns
                      </Text>
                      <div className="flex flex-wrap gap-1">
                        {checkResult.detected_patterns.slice(0, 4).map((pattern, index) => (
                          <Tag key={index} color="blue" className="text-xs m-0">
                            {pattern.replace('_', ' ')}
                          </Tag>
                        ))}
                        {checkResult.detected_patterns.length > 4 && (
                          <Tag className="text-xs m-0">
                            +{checkResult.detected_patterns.length - 4}
                          </Tag>
                        )}
                      </div>
                    </div>
                  )}
        
                  {/* Extracted URLs */}
                  {checkResult.extracted_urls?.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <Text strong className="text-sm text-red-800 block mb-2">
                        Extracted URLs ({checkResult.extracted_urls.length})
                      </Text>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {checkResult.extracted_urls.map((url, index) => (
                          <div key={index} className="flex items-center">
                            <LinkOutlined className="text-red-500 mr-2 text-xs" />
                            <Text className="text-xs break-all" code>
                              {url.length > 40 ? url.substring(0, 40) + '...' : url}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
        
                  {/* Recommendations */}
                  {checkResult.recommendations?.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Text strong className="text-sm text-green-800 block mb-2">
                        Recommendations
                      </Text>
                      <div className="space-y-1">
                        {checkResult.recommendations.slice(0, 2).map((rec, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircleOutlined className="text-green-500 mr-2 text-xs mt-0.5" />
                            <Text className="text-xs leading-relaxed">{rec}</Text>
                          </div>
                        ))}
                        {checkResult.recommendations.length > 2 && (
                          <Text className="text-xs text-gray-600">
                            +{checkResult.recommendations.length - 2} more recommendations...
                          </Text>
                        )}
                      </div>
                    </div>
                  )}
        
                  {/* Timestamp */}
                  {checkResult.timestamp && (
                    <div className="text-center pt-2 border-t border-gray-200">
                      <Text type="secondary" className="text-xs">
                        {new Date(checkResult.timestamp).toLocaleString()}
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
                      background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                      border: 'none'
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
                  type: '',
                  identifier: '',
                  description: '',
                  additionalInfo: '',
                  source: 'web'
                });
              }}
              footer={null}
              width={600}
            >
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Scam Type *
                  </label>
                  <Select 
                    placeholder="Select scam type" 
                    style={{ width: '100%' }}
                    value={reportFormData.type}
                    onChange={(value) => setReportFormData(prev => ({ ...prev, type: value }))}
                  >
                    <Option value={ScammerType.EMAIL}>Email</Option>
                    <Option value={ScammerType.PHONE}>Phone</Option>
                    <Option value={ScammerType.SOCIAL_MEDIA}>Social Media</Option>
                    <Option value={ScammerType.WEBSITE}>Website</Option>
                    <Option value={ScammerType.OTHER}>Other</Option>
                  </Select>
                </div>
      
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Contact Information *
                  </label>
                  <Input 
                    placeholder="Enter email, phone, username, or website"
                    value={reportFormData.identifier}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, identifier: e.target.value }))}
                  />
                </div>
      
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Description *
                  </label>
                  <TextArea
                    rows={4}
                    placeholder="Describe how this scammer tried to deceive you..."
                    value={reportFormData.description}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
      
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Additional Information
                  </label>
                  <TextArea
                    rows={3}
                    placeholder="Any additional details about this scammer..."
                    value={reportFormData.additionalInfo}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  />
                </div>
      
                <div style={{ textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => {
                      setReportModalVisible(false);
                      setReportFormData({
                        type: '',
                        identifier: '',
                        description: '',
                        additionalInfo: '',
                        source: 'web'
                      });
                    }}>
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
                  type: '',
                  identifier: ''
                });
              }}
              footer={null}
              width={500}
            >
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Type *
                  </label>
                  <Select 
                    placeholder="Select type to check" 
                    style={{ width: '100%' }}
                    value={checkFormData.type}
                    onChange={(value) => setCheckFormData(prev => ({ ...prev, type: value }))}
                  >
                    <Option value={ScammerType.EMAIL}>Email</Option>
                    <Option value={ScammerType.PHONE}>Phone</Option>
                    <Option value={ScammerType.SOCIAL_MEDIA}>Social Media</Option>
                    <Option value={ScammerType.WEBSITE}>Website</Option>
                    <Option value={ScammerType.OTHER}>Other</Option>
                  </Select>
                </div>
      
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Contact Information *
                  </label>
                  <Input 
                    placeholder="Enter email, phone, username, or website to check"
                    value={checkFormData.identifier}
                    onChange={(e) => setCheckFormData(prev => ({ ...prev, identifier: e.target.value }))}
                  />
                </div>
      
                <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                  <Space>
                    <Button onClick={() => {
                      setCheckaModalVisible(false);
                      setCheckResult(null);
                      setCheckFormData({
                        type: '',
                        identifier: ''
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
                    message={checkResult.isScammer ? "⚠️ Scammer Found!" : "✅ No Scammer Record"}
                    description={checkResult.message}
                    type={checkResult.isScammer ? "error" : "success"}
                    showIcon
                  />
                )}
              </div>
            </Modal>
          </div>
    
    
  )
}