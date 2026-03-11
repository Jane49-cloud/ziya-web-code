import React from "react";
import { Card, Typography, Divider, List, Space, Tag, Anchor } from "antd";
import {
  Shield,
  FileText,
  Users,
  Globe,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const { Title, Paragraph, Text } = Typography;

const ZiyaPrivacyPolicy: React.FC = () => {
  const dataCategories = [
    {
      title: "Personal Information",
      items: [
        "Full name, date of birth, national ID number",
        "Contact details (email, phone number, physical address)",
      ],
    },
    {
      title: "Financial Information",
      items: [
        "Loan application details (income, employment status)",
        "Repayment history and transaction records",
      ],
    },
    {
      title: "Device and Technical Information",
      items: [
        "IP address, device type, operating system, and unique device identifiers",
        "App usage data (e.g., login times, features accessed)",
      ],
    },
    {
      title: "Location Data",
      items: [
        "GPS data (optional, used only with explicit consent for service optimization)",
      ],
    },
  ];

  const legalBases = [
    {
      basis: "Consent",
      description:
        "Explicitly obtained for specific purposes (e.g., location tracking)",
    },
    {
      basis: "Contractual Necessity",
      description: "To provide loan services and manage your account",
    },
    {
      basis: "Legal Obligations",
      description: "Compliance with Kenyan laws (e.g., anti-money laundering)",
    },
    {
      basis: "Legitimate Interests",
      description:
        "Fraud prevention, service improvement, and business operations",
    },
  ];

  const dataUses = [
    "Process loan applications and disbursements",
    "Communicate updates, repayment reminders, and offers",
    "Improve app functionality and user experience",
    "Comply with regulatory requirements (e.g., reporting to credit bureaus)",
    "Prevent fraud and ensure security",
  ];

  const userRights = [
    "Access, correct, or delete your data",
    "Object to processing or request data portability",
    "Withdraw consent (via in-app settings or by contacting us)",
  ];

  const securityMeasures = [
    {
      measure: "Encryption",
      description: "Data in transit and at rest using AES-256 standards",
    },
    {
      measure: "Access Controls",
      description: "Role-based access limited to authorized personnel",
    },
    {
      measure: "Audits",
      description: "Regular security assessments and penetration testing",
    },
  ];

  const retentionPeriods = [
    { category: "Active Users", period: "Until account closure" },
    { category: "Inactive Accounts", period: "2 years post-inactivity" },
    {
      category: "Legal Requirements",
      period: "Financial records retained for 7 years",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col space-y-8 gap-2">
        {/* Header */}
        <Card
          className="mb-8 shadow-lg border-0"
          // style={{ marginBottom: "1rem", marginTop: "1rem" }}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <Title level={1} className="text-gray-800 mb-2">
              Privacy Policy
            </Title>
            <Title level={3} className="text-blue-600 mb-4">
              Ziya Mobile Application
            </Title>
            <div className="flex justify-center space-x-4 mb-4">
              <Tag color="blue">Last Updated: 08 Aug 2025</Tag>
              <Tag color="green">Version:1.0.1</Tag>
            </div>
          </div>
        </Card>

        {/* Quick Navigation */}
        <Card
          className="mb-8 shadow-md z-20"
          styles={{
            body: { position: "relative", zIndex: 50, background: "#fff" },
          }}
        >
          <Title level={4} className="mb-4">
            Quick Navigation
          </Title>
          <Anchor
            direction="horizontal"
            items={[
              { key: "1", href: "#introduction", title: "Introduction" },
              { key: "2", href: "#data-collection", title: "Data Collection" },
              { key: "3", href: "#your-rights", title: "Your Rights" },
              { key: "4", href: "#contact", title: "Contact" },
            ]}
            className="flex flex-wrap z-20"
            style={{ zIndex: 20 }}
          />
        </Card>

        {/* Introduction */}
        <Card className="mb-8 shadow-md" id="introduction">
          <Title level={2} className="text-gray-800 mb-4">
            <FileText className="inline h-6 w-6 mr-2" />
            Introduction
          </Title>
          <Paragraph className="text-gray-700 text-base leading-relaxed">
            Ziya Limited ("we," "us," or "our") is committed to protecting the
            privacy and security of your personal data. As a registered Data
            Controller and Processor (Registration Number: [Insert ODPC
            Registration Number]) under Kenya's Data Protection Act, 2019, and
            approved by the Office of the Data Protection Commissioner (ODPC),
            we adhere strictly to legal and regulatory requirements.
          </Paragraph>
          <Paragraph className="text-gray-700 text-base leading-relaxed">
            This Privacy Policy explains how we collect, use, store, and protect
            your information when you use the Ziya Mobile App ("the App"). By
            using the App, you consent to the practices described in this
            policy.
          </Paragraph>
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <Text strong className="text-blue-800">
              Scope:
            </Text>
            <Text className="text-blue-700 ml-2">
              This policy applies to all users of the Ziya Mobile App in Kenya.
            </Text>
          </div>
        </Card>

        {/* Data Collection */}
        <Card className="mb-8 shadow-md" id="data-collection">
          <Title level={2} className="text-gray-800 mb-4">
            <Users className="inline h-6 w-6 mr-2" />
            Data We Collect
          </Title>
          <div className="grid md:grid-cols-2 gap-6">
            {dataCategories.map((category, index) => (
              <Card key={index} className="border border-gray-200 bg-gray-50">
                <Title level={4} className="text-gray-800 mb-3">
                  {category.title}
                </Title>
                <List
                  size="small"
                  dataSource={category.items}
                  renderItem={(item) => (
                    <List.Item className="border-0 py-1">
                      <Text className="text-gray-600">• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </div>
        </Card>

        {/* Legal Basis */}
        <Card className="mb-8 shadow-md">
          <Title level={2} className="text-gray-800 mb-4">
            Legal Basis for Processing
          </Title>
          <div className="space-y-4">
            {legalBases.map((item, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50"
              >
                <Text strong className="text-gray-800">
                  {item.basis}:
                </Text>
                <Text className="text-gray-600 ml-2">{item.description}</Text>
              </div>
            ))}
          </div>
        </Card>

        {/* How We Use Data */}
        <Card className="mb-8 shadow-md">
          <Title level={2} className="text-gray-800 mb-4">
            How We Use Your Data
          </Title>
          <List
            dataSource={dataUses}
            renderItem={(item) => (
              <List.Item className="border-0">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <Text className="text-gray-700">{item}</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Data Security */}
        <Card className="mb-8 shadow-md">
          <Title level={2} className="text-gray-800 mb-4">
            <Shield className="inline h-6 w-6 mr-2" />
            Data Security
          </Title>
          <Paragraph className="text-gray-700 mb-4">
            We implement robust safeguards:
          </Paragraph>
          <div className="grid md:grid-cols-3 gap-4">
            {securityMeasures.map((item, index) => (
              <Card key={index} className="border border-green-200 bg-green-50">
                <Title level={5} className="text-green-800 mb-2">
                  {item.measure}
                </Title>
                <Text className="text-green-700 text-sm">
                  {item.description}
                </Text>
              </Card>
            ))}
          </div>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8 shadow-md" id="your-rights">
          <Title level={2} className="text-gray-800 mb-4">
            Your Rights
          </Title>
          <Paragraph className="text-gray-700 mb-4">
            Under the Data Protection Act, you have the right to:
          </Paragraph>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <List
              dataSource={userRights}
              renderItem={(item) => (
                <List.Item className="border-0">
                  <div className="flex items-center">
                    <div className="bg-yellow-400 rounded-full w-3 h-3 mr-3"></div>
                    <Text className="text-gray-800">{item}</Text>
                  </div>
                </List.Item>
              )}
            />
            <div className="mt-4 p-4 bg-white rounded border">
              <Text strong className="text-gray-800">
                To exercise these rights:
              </Text>
              <div className="mt-2 space-y-1">
                <div>
                  📧 Email: <Text code>dpo@ziya.co.ke</Text>
                </div>
                <div>📱 Use the App's "Privacy Dashboard"</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8 shadow-md">
          <Title level={2} className="text-gray-800 mb-4">
            Data Retention
          </Title>
          <Paragraph className="text-gray-700 mb-4">
            We retain your data only as long as necessary:
          </Paragraph>
          <div className="space-y-3">
            {retentionPeriods.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <Text strong className="text-gray-800">
                  {item.category}
                </Text>
                <Tag color="orange">{item.period}</Tag>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <Text className="text-blue-800">
              Data is anonymized or securely deleted thereafter.
            </Text>
          </div>
        </Card>

        {/* Additional Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-md">
            <Title level={3} className="text-gray-800 mb-3">
              <Globe className="inline h-5 w-5 mr-2" />
              International Data Transfers
            </Title>
            <Paragraph className="text-gray-700 text-sm">
              Data may be transferred to trusted partners outside Kenya, but
              only to countries with adequate data protection laws or under
              approved safeguards (e.g., EU Standard Contractual Clauses).
            </Paragraph>
          </Card>

          <Card className="shadow-md">
            <Title level={3} className="text-gray-800 mb-3">
              Children's Privacy
            </Title>
            <Paragraph className="text-gray-700 text-sm">
              The App is not intended for users under 18. We do not knowingly
              collect data from minors.
            </Paragraph>
          </Card>
        </div>

        {/* Contact Information */}
        <Card
          className="mb-8 shadow-lg border-t-4 border-t-blue-500"
          id="contact"
        >
          <Title level={2} className="text-gray-800 mb-6">
            Contact Us
          </Title>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Title level={4} className="text-blue-600 mb-4">
                Data Protection Officer - Ziya Limited
              </Title>
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <Text className="text-gray-700">
                    [Physical Address in Kenya]
                  </Text>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <Text className="text-gray-700">dpo@ziya.co.ke</Text>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <Text className="text-gray-700">+254 736 710 073</Text>
                </div>
              </Space>
            </div>

            <div>
              <Title level={4} className="text-orange-600 mb-4">
                ODPC Complaints
              </Title>
              <Space direction="vertical" size="small" className="w-full">
                <Text strong className="text-gray-800">
                  Office of the Data Protection Commissioner
                </Text>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <Text className="text-gray-700">
                    P.O. Box 30920-00100, Nairobi, Kenya
                  </Text>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <Text className="text-gray-700">complaints@odpc.go.ke</Text>
                </div>
              </Space>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <Card className="shadow-md bg-gray-50">
          <div className="text-center">
            <Text className="text-gray-600">
              This Policy complies with Kenya's Data Protection Act, 2019, and
              ODPC Guidelines.
            </Text>
            <Divider />
            <Text className="text-gray-500 text-sm">End of Policy</Text>
            <div className="mt-4">
              <Tag color="blue">Kenya Data Protection Act 2019 Compliant</Tag>
              <Tag color="green">ODPC Approved</Tag>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ZiyaPrivacyPolicy;
