import { Button, Divider, Form, Row, Space, Typography, message } from "antd";
import { FiSave } from "react-icons/fi";

import { useCreateSaccoMutation } from "../features";
import {
    cleanLowerInput,
    sanitizePhoneNumber,
} from "../../utils/index";

import PartnerOnboardingFields from "../components/partnerOnboardingFld";

const { Title, Text } = Typography;

type CreateSaccoFormValues = {
    partner_name: string;
    partner_location: string;
    cp_firstname: string;
    cp_middlename?: string;
    cp_lastname: string;
    cp_phone_number: string;
    cp_email_address: string;
};

type CreateSaccoTabProps = {
    onCancel?: () => void;
    onCreated: () => void;
};

const CreateSaccoTab = ({ onCreated }: CreateSaccoTabProps) => {
    const [form] = Form.useForm<CreateSaccoFormValues>();
    const [messageApi, contextHolder] = message.useMessage();

    const [createSacco, { isLoading: isCreating }] = useCreateSaccoMutation();

    const handleSubmit = async (values: CreateSaccoFormValues) => {
        try {
            await createSacco({
                partner_name: cleanLowerInput(values.partner_name),
                partner_location: cleanLowerInput(values.partner_location),
                cp_firstname: cleanLowerInput(values.cp_firstname),
                cp_middlename: cleanLowerInput(values.cp_middlename),
                cp_lastname: cleanLowerInput(values.cp_lastname),
                cp_phone_number: sanitizePhoneNumber(values.cp_phone_number),
                cp_email_address: cleanLowerInput(values.cp_email_address),
            }).unwrap();

            messageApi.success("Partner created successfully.");

            form.resetFields();
            onCreated();
        } catch (error: any) {
            const errorMessage =
                error?.data?.message ||
                error?.error ||
                "Failed to create partner.";

            messageApi.error(errorMessage);
        }
    };

    return (
        <>
            {contextHolder}

            <div>
                <Title level={4} style={{ marginBottom: 4 }}>
                    Create Partner
                </Title>

                <Text type="secondary">
                    Onboard a new partner and create the chairperson details.
                </Text>

                <Divider />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                >
                    <PartnerOnboardingFields />

                    <Row justify="end" style={{ marginTop: 24 }}>
                        <Space>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                icon={<FiSave />}
                                loading={isCreating}
                            >
                                Create Partner
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </div>
        </>
    );
};

export default CreateSaccoTab;