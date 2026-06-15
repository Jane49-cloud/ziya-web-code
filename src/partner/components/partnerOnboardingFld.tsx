import { Col, Form, Input, Row, Typography } from "antd";
import { FiMapPin, FiUserPlus } from "react-icons/fi";
import {
    phoneNumberAntdRules,
    phoneNumberInputProps,
} from "../../utils/index"; // adjust path if needed

const { Title } = Typography;

const PartnerOnboardingFields = () => {
    return (
        <>
            <Row gutter={[24, 8]}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Partner Name"
                        name="partner_name"
                        rules={[
                            {
                                required: true,
                                message: "Please enter partner name.",
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<FiUserPlus />}
                            placeholder="e.g. tuktuk sacco"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        label="Partner Location"
                        name="partner_location"
                        rules={[
                            {
                                required: true,
                                message: "Please enter partner location.",
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<FiMapPin />}
                            placeholder="e.g. mombasa"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Title level={5} style={{ marginTop: 16, marginBottom: 16 }}>
                Chairperson Details
            </Title>

            <Row gutter={[24, 8]}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="First Name"
                        name="cp_firstname"
                        rules={[
                            {
                                required: true,
                                message: "Please enter first name.",
                            },
                        ]}
                    >
                        <Input size="large" placeholder="e.g. musa" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item label="Middle Name" name="cp_middlename">
                        <Input size="large" placeholder="e.g. juma" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        label="Last Name"
                        name="cp_lastname"
                        rules={[
                            {
                                required: true,
                                message: "Please enter last name.",
                            },
                        ]}
                    >
                        <Input size="large" placeholder="e.g. hassan" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        label="Phone Number"
                        name="cp_phone_number"
                        rules={phoneNumberAntdRules}
                    >
                        <Input
                            size="large"
                            placeholder="e.g. 0789233446"
                            {...phoneNumberInputProps}
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item
                        label="Email Address"
                        name="cp_email_address"
                        rules={[
                            {
                                required: true,
                                message: "Please enter email address.",
                            },
                            {
                                type: "email",
                                message: "Please enter a valid email address.",
                            },
                        ]}
                    >
                        <Input size="large" placeholder="e.g. test@gmail.com" />
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};

export default PartnerOnboardingFields;