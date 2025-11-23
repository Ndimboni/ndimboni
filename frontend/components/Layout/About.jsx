import { useState, useEffect } from 'react'
import { Typography, Button, Row, Col, Card, Space, Timeline, Progress } from 'antd'
import { 
  UserOutlined, 
  CodeOutlined, 
  BulbOutlined, 
  TeamOutlined,
  AimOutlined,
  HeartOutlined,
  TrophyOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  BookOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Paragraph, Text } = Typography

import { siteConfig } from '../../config/site'

export default function About() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const skills = [
    { name: 'AI & Machine Learning', level: 95 },
    { name: 'Natural Language Processing', level: 90 },
    
    { name: 'FastAPI & Python', level: 88 },
    { name: 'Cybersecurity', level: 85 },
    { name: 'Cloud Computing (AWS)', level: 83 }
  ]

  const timeline = [
    {
      title: 'Research & Problem Identification',
      description: 'Identified the growing threat of digital scams in Rwanda and conducted extensive research on AI-powered detection methods',
      date: '2024 '
    },
    {
      title: 'Literature Review & Methodology',
      description: 'Analyzed existing cybersecurity solutions and developed comprehensive research methodology with local context focus',
      date: '2024 '
    },
    {
      title: 'Platform Development',
      description: `Built the ${siteConfig.name} platform using React Native, FastAPI, and advanced AI algorithms for scam detection`,
      date: '2024 '
    },
    {
      title: 'Testing & Community Launch',
      description: 'Conducted prototype testing and launched the platform to protect Rwandan citizens from digital threats',
      date: '2025'
    }
  ]

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

   const handleOpenEducationPage = () => {
  window.location.href = '/education';
 
};

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Hero Section */}
        <section className="bg-white text-dark py-20">
          <div className="container mx-auto px-6">
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Title level={1} className="mb-6" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2980B9' }}>
                    About <span style={{ color: '#1A5276' }}>{siteConfig.name}</span>
                  </Title>
                  <Paragraph className="text-lg mb-8 leading-relaxed" style={{ color: '#1A5276' }}>
                    {siteConfig.description}
                  </Paragraph>
                  <Space size="large" className="flex flex-col sm:flex-row">
                    <Button
                      type="primary"
                      size="large"
                      icon={<SafetyOutlined />}
                      className="font-semibold px-8 py-3 h-auto"
                      style={{ 
                        background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                      }}
                      onClick={handleOpenEducationPage}
                    >
                      Learn More
                    </Button>
                  
                  </Space>
                </motion.div>
              </Col>
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center"
                >
                  <div 
                    className="rounded-2xl p-8"
                    style={{
                      backgroundColor: '#EBF5FB',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center"
                      >
                        <div className="text-4xl font-bold mb-2" style={{ color: '#1A5276' }}>AI</div>
                        <div className="text-sm" style={{ color: '#2980B9' }}>Powered Detection</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center"
                      >
                        <div className="text-4xl font-bold mb-2" style={{ color: '#1A5276' }}>3</div>
                        <div className="text-sm" style={{ color: '#2980B9' }}>Core Features</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center"
                      >
                        <div className="text-4xl font-bold mb-2" style={{ color: '#1A5276' }}>24/7</div>
                        <div className="text-sm" style={{ color: '#2980B9' }}>Protection</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center"
                      >
                        <div className="text-4xl font-bold mb-2" style={{ color: '#1A5276' }}>RW</div>
                        <div className="text-sm" style={{ color: '#2980B9' }}>Local Focus</div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="py-6 bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1]">
          <div className="container mx-auto px-6">
            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className="h-full"
                    style={{ 
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.3)',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <div className="text-center mb-6">
                      <GlobalOutlined className="text-2xl mb-4" style={{ color: '#e74c3c' }} />
                      <Title level={3} style={{ color: '#1A5276' }}>The Problem</Title>
                    </div>
                    <Paragraph className="text-base leading-relaxed" style={{ color: '#1A5276' }}>
                      Digital scams are increasingly targeting Rwandans through phishing, fake investment schemes, 
                      fraudulent money transfers, and false job offers. Current measures are fragmented, leaving 
                      users vulnerable to financial losses and psychological distress due to lack of awareness 
                      and centralized reporting systems.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={12}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className="h-full"
                    style={{ 
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.3)',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <div className="text-center mb-6">
                      <BulbOutlined className="text-5xl mb-4" style={{ color: '#2980B9' }} />
                      <Title level={3} style={{ color: '#1A5276' }}>Our Solution</Title>
                    </div>
                    <Paragraph className="text-base leading-relaxed" style={{ color: '#1A5276' }}>
                      {siteConfig.name} integrates AI-powered scam detection using machine learning and NLP, interactive 
                      educational simulations to raise awareness, and a centralized reporting system. Our platform 
                      is specifically tailored for the Rwandan context with local language support and cultural relevance.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-6" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Title level={2} className="text-4xl font-bold mb-6" style={{ color: '#1A5276' }}>
                Core Features
              </Title>
              <Paragraph className="text-lg max-w-3xl mx-auto" style={{ color: '#1A5276' }}>
                Our platform combines three essential components to provide comprehensive protection against digital scams.
              </Paragraph>
            </motion.div>

            <Row gutter={[32, 32]}>
              {[
                {
                  icon: <ExperimentOutlined className="text-4xl" style={{ color: '#2980B9' }} />,
                  title: 'AI-Powered Detection',
                  description: 'Advanced machine learning algorithms and Natural Language Processing to identify and classify various types of digital scams in real-time.'
                },
                {
                  icon: <BookOutlined className="text-4xl" style={{ color: '#2980B9' }} />,
                  title: 'Interactive Education',
                  description: 'Engaging simulations and educational resources designed to raise awareness about different scam tactics and prevention strategies.'
                },
                {
                  icon: <SafetyOutlined className="text-4xl" style={{ color: '#2980B9' }} />,
                  title: 'Centralized Reporting',
                  description: 'Secure reporting system integrated with WhatsApp API and optional USSD for easy scam reporting and threat notifications.'
                }
              ].map((feature, index) => (
                <Col xs={24} md={8} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      className="text-center h-full"
                      style={{
                        borderRadius: '20px',
                        backgroundColor: '#EBF5FB',
                        border: '1px solid rgba(174, 214, 241, 0.3)',
                        boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                      }}
                    >
                      <div className="mb-4">{feature.icon}</div>
                      <Title level={4} className="mb-3" style={{ color: '#1A5276' }}>
                        {feature.title}
                      </Title>
                      <Paragraph className="text-sm" style={{ color: '#1A5276' }}>
                        {feature.description}
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-6 bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Title level={2} className="text-4xl font-bold mb-6" style={{ color: '#1A5276' }}>
                Meet Our Team
              </Title>
              <Paragraph className="text-lg max-w-3xl mx-auto" style={{ color: '#1A5276' }}>
                Computer and Software Engineering students from the University of Rwanda, College of Science and Technology, 
                passionate about leveraging AI to protect Rwanda's digital future.
              </Paragraph>
            </motion.div>

            <Row gutter={[32, 32]} justify="center">
              {siteConfig.team.map((member, index) => (
                <Col xs={24} md={12} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      className="text-center h-full"
                      style={{
                        borderRadius: '20px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(174, 214, 241, 0.3)',
                        boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                      }}
                    >
                      <div className="mb-6">
                        <div 
                          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ backgroundColor: '#2980B9' }}
                        >
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserOutlined className="text-3xl text-white" />
                          )}
                        </div>
                        <Title level={4} style={{ color: '#1A5276' }}>{member.name}</Title>
                        <Text className="block mb-2" style={{ color: '#2980B9', fontSize: '1rem', fontWeight: 600 }}>
                          {member.role}
                        </Text>
                        <Paragraph className="text-sm" style={{ color: '#1A5276' }}>
                          {member.bio}
                        </Paragraph>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Technical Stack & Timeline */}
        <section className="py-6" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container mx-auto px-6">
            <Row gutter={[32, 32]}>
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card
                    style={{
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.3)',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <Title level={3} className="mb-6" style={{ color: '#1A5276' }}>Technical Expertise</Title>
                    {skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="mb-4"
                      >
                        <div className="flex justify-between mb-2">
                          <Text style={{ color: '#1A5276', fontWeight: 600 }}>{skill.name}</Text>
                          <Text style={{ color: '#2980B9', fontWeight: 600 }}>{skill.level}%</Text>
                        </div>
                        <Progress 
                          percent={skill.level} 
                          showInfo={false}
                          strokeColor={{
                            '0%': '#2980B9',
                            '100%': '#1A5276',
                          }}
                          trailColor="#EBF5FB"
                        />
                      </motion.div>
                    ))}
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card
                    style={{
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.3)',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <Title level={3} className="mb-6" style={{ color: '#1A5276' }}>Project Timeline</Title>
                    <Timeline>
                      {timeline.map((item, index) => (
                        <Timeline.Item
                          key={index}
                          dot={<TrophyOutlined style={{ color: '#2980B9' }} />}
                        >
                          <div className="mb-2">
                            <Text strong style={{ color: '#1A5276' }}>{item.title}</Text>
                            <Text className="ml-2" style={{ color: '#2980B9' }}>({item.date})</Text>
                          </div>
                          <Paragraph className="text-sm mb-0" style={{ color: '#1A5276' }}>
                            {item.description}
                          </Paragraph>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Mission & Impact Section */}
        <section className="py-6 bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Title level={2} className="text-4xl font-bold mb-6" style={{ color: '#1A5276' }}>
                Our Mission & Impact
              </Title>
            </motion.div>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    className="text-center h-full"
                    style={{
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.3)',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <AimOutlined className="text-4xl mb-4" style={{ color: '#2980B9' }} />
                    <Title level={4} className="mb-3" style={{ color: '#1A5276' }}>
                      Targeted Protection
                    </Title>
                    <Paragraph className="text-sm" style={{ color: '#1A5276' }}>
                      Specifically designed for Rwanda's digital ecosystem, addressing local scam trends and 
                      supporting multiple demographic groups including youth, entrepreneurs, and the general public.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    className="text-center h-full"
                    style={{
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.3)',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <HeartOutlined className="text-4xl mb-4" style={{ color: '#2980B9' }} />
                    <Title level={4} className="mb-3" style={{ color: '#1A5276' }}>
                      Community Impact
                    </Title>
                    <Paragraph className="text-sm" style={{ color: '#1A5276' }}>
                      Reducing financial losses and psychological distress caused by digital scams while building 
                      trust in digital platforms through education and proactive protection measures.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    className="text-center h-full"
                    style={{
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.3)',
                      boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                    }}
                  >
                    <TeamOutlined className="text-4xl mb-4" style={{ color: '#2980B9' }} />
                    <Title level={4} className="mb-3" style={{ color: '#1A5276' }}>
                      Collaborative Approach
                    </Title>
                    <Paragraph className="text-sm" style={{ color: '#1A5276' }}>
                      Bridging the gap between citizens and authorities through centralized reporting and 
                      improving collaboration in combating cybercrime across Rwanda.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>
      </div>
    </div>
  )
}