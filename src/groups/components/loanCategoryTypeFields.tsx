/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Form, Select, message } from "antd";

import {
    useGetLoanCategoriesQuery,
    useLazyGetSingleLoanCategoryQuery,
} from "../../Loans/features/loanCategorySlice";

import { formatName } from "../../utils";

type LoanCategory = {
    id: number;
    name: string;
};

type LoanSubcategory = {
    id: number;
    name: string;
    parent_category_id?: number;
};

type Props = {
    form: any;
    categoryFieldName?: string;
    typeFieldName?: string;
    initialCategoryId?: string | number | null;
    initialLoanTypeId?: string | number | null;
    disabled?: boolean;
    onReadyChange?: (ready: boolean) => void;
};

const extractLoanTypes = (response: any): LoanSubcategory[] => {
    const rows =
        response?.data?.sub_categories ??
        response?.sub_categories ??
        response?.data?.data?.sub_categories ??
        [];

    return Array.isArray(rows) ? rows : [];
};

const normalizeValue = (value?: string | number | null) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? value : numberValue;
};

const LoanCategoryTypeFields = ({
    form,
    categoryFieldName = "loan_category_id",
    typeFieldName = "loan_type",
    initialCategoryId,
    initialLoanTypeId,
    disabled = false,
    onReadyChange,
}: Props) => {
    const [selectedCategoryId, setSelectedCategoryId] =
        useState<string | number | null>(initialCategoryId ?? null);

    const [loanTypes, setLoanTypes] = useState<LoanSubcategory[]>([]);

    const {
        data: categoriesResponse,
        isLoading: loadingCategories,
    } = useGetLoanCategoriesQuery({
        page: 1,
        page_size: 100,
    });

    const [
        getSingleLoanCategory,
        { isFetching: loadingLoanTypes },
    ] = useLazyGetSingleLoanCategoryQuery();

    const loanCategories = useMemo(() => {
        return Array.isArray(categoriesResponse?.data)
            ? categoriesResponse.data
            : [];
    }, [categoriesResponse]);

    const loadLoanTypes = useCallback(
        async (categoryId: string | number) => {
            const response = await getSingleLoanCategory(categoryId).unwrap();
            const rows = extractLoanTypes(response);

            setLoanTypes(rows);

            return rows;
        },
        [getSingleLoanCategory],
    );

    const handleCategoryChange = useCallback(
        async (categoryId?: string | number) => {
            if (!categoryId) {
                setSelectedCategoryId(null);
                setLoanTypes([]);

                form.setFieldsValue({
                    [typeFieldName]: undefined,
                });

                onReadyChange?.(true);
                return;
            }

            setSelectedCategoryId(categoryId);
            setLoanTypes([]);

            form.setFieldsValue({
                [typeFieldName]: undefined,
            });

            try {
                onReadyChange?.(false);
                await loadLoanTypes(categoryId);
            } catch (err: any) {
                message.error(
                    err?.data?.message ||
                    err?.message ||
                    "Failed to load loan types",
                );
            } finally {
                onReadyChange?.(true);
            }
        },
        [form, typeFieldName, loadLoanTypes, onReadyChange],
    );

    useEffect(() => {
        let active = true;

        const preloadInitialValues = async () => {
            if (!initialCategoryId) {
                setSelectedCategoryId(null);
                setLoanTypes([]);
                onReadyChange?.(true);
                return;
            }

            try {
                onReadyChange?.(false);

                const categoryValue = normalizeValue(initialCategoryId);
                const typeValue = normalizeValue(initialLoanTypeId);

                setSelectedCategoryId(categoryValue ?? null);

                form.setFieldsValue({
                    [categoryFieldName]: categoryValue,
                });

                await loadLoanTypes(initialCategoryId);

                if (!active) return;

                if (typeValue !== undefined) {
                    form.setFieldsValue({
                        [typeFieldName]: typeValue,
                    });
                }
            } catch (err: any) {
                if (!active) return;

                setLoanTypes([]);

                message.error(
                    err?.data?.message ||
                    err?.message ||
                    "Failed to preload loan category details",
                );
            } finally {
                if (active) {
                    onReadyChange?.(true);
                }
            }
        };

        void preloadInitialValues();

        return () => {
            active = false;
        };
    }, [
        initialCategoryId,
        initialLoanTypeId,
        categoryFieldName,
        typeFieldName,
        form,
        loadLoanTypes,
        onReadyChange,
    ]);

    return (
        <>
            <Form.Item
                label="Loan Category"
                name={categoryFieldName}
                rules={[
                    {
                        required: true,
                        message: "Please select loan category",
                    },
                ]}
            >
                <Select
                    showSearch
                    allowClear
                    placeholder="Select loan category"
                    loading={loadingCategories}
                    disabled={disabled}
                    optionFilterProp="label"
                    onChange={handleCategoryChange}
                    options={loanCategories.map((category: LoanCategory) => ({
                        label: formatName(category.name) || "Unnamed Category",
                        value: category.id,
                    }))}
                />
            </Form.Item>

            <Form.Item
                label="Loan Type"
                name={typeFieldName}
                rules={[
                    {
                        required: true,
                        message: "Please select loan type",
                    },
                ]}
            >
                <Select
                    showSearch
                    allowClear
                    placeholder={
                        selectedCategoryId
                            ? "Select loan type"
                            : "Select loan category first"
                    }
                    disabled={disabled || !selectedCategoryId}
                    loading={loadingLoanTypes}
                    optionFilterProp="label"
                    options={loanTypes.map((type: LoanSubcategory) => ({
                        label: formatName(type.name) || "Unnamed Type",
                        value: type.id,
                    }))}
                />
            </Form.Item>
        </>
    );
};

export default LoanCategoryTypeFields;