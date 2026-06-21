/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Form, Select } from "antd";

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
};

const LoanCategoryTypeFields = ({
    form,
    categoryFieldName = "loan_category_id",
    typeFieldName = "loan_type",
    initialCategoryId,
}: Props) => {
    const [selectedCategoryId, setSelectedCategoryId] =
        useState<string | number | null>(
            initialCategoryId ?? null,
        );

    const {
        data: categoriesResponse,
        isLoading: loadingCategories,
    } = useGetLoanCategoriesQuery({
        page: 1,
        page_size: 100,
    });

    const [
        getSingleLoanCategory,
        {
            data: singleCategoryResponse,
            isFetching: loadingLoanTypes,
        },
    ] = useLazyGetSingleLoanCategoryQuery();

    const loanCategories = useMemo(() => {
        return Array.isArray(categoriesResponse?.data)
            ? categoriesResponse.data
            : [];
    }, [categoriesResponse]);

    const loanTypes = useMemo(() => {
        return Array.isArray(
            singleCategoryResponse?.data?.sub_categories,
        )
            ? singleCategoryResponse.data.sub_categories
            : [];
    }, [singleCategoryResponse]);

    const handleCategoryChange = useCallback(
        async (categoryId?: string | number) => {
            if (!categoryId) {
                setSelectedCategoryId(null);

                form.setFieldsValue({
                    [typeFieldName]: undefined,
                });

                return;
            }

            setSelectedCategoryId(categoryId);

            form.setFieldsValue({
                [typeFieldName]: undefined,
            });

            await getSingleLoanCategory(categoryId);
        },
        [form, typeFieldName, getSingleLoanCategory],
    );

    useEffect(() => {
        if (!initialCategoryId) {
            setSelectedCategoryId(null);
            return;
        }

        setSelectedCategoryId(initialCategoryId);
        getSingleLoanCategory(initialCategoryId);
    }, [initialCategoryId, getSingleLoanCategory]);

    return (
        <>
            <Form.Item
                label="Loan Category"
                name={categoryFieldName}
                rules={[
                    {
                        required: true,
                        message:
                            "Please select loan category",
                    },
                ]}
            >
                <Select
                    showSearch
                    allowClear
                    placeholder="Select loan category"
                    loading={loadingCategories}
                    optionFilterProp="label"
                    onChange={handleCategoryChange}
                    options={loanCategories.map(
                        (category: LoanCategory) => ({
                            label:
                                formatName(category.name) ||
                                "Unnamed Category",
                            value: category.id,
                        }),
                    )}
                />
            </Form.Item>

            <Form.Item
                label="Loan Type"
                name={typeFieldName}
                rules={[
                    {
                        required: true,
                        message:
                            "Please select loan type",
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
                    disabled={!selectedCategoryId}
                    loading={loadingLoanTypes}
                    optionFilterProp="label"
                    options={loanTypes.map(
                        (type: LoanSubcategory) => ({
                            label:
                                formatName(type.name) ||
                                "Unnamed Type",
                            value: type.id,
                        }),
                    )}
                />
            </Form.Item>
        </>
    );
};

export default LoanCategoryTypeFields;