/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import clsx from "clsx";
import { Alert } from "../../../components/Alert";
import { styles } from "../../../styles";
import { useValidateCodeMutation } from "../../features/authApi";

const otpSchema = Yup.object().shape({
  code: Yup.string()
    .length(4, "Code must be 4 digits")
    .required("Reset code is required"),
});

function ValidateCode() {
  const navigate = useNavigate();
  const [validateCode, { isLoading }] = useValidateCodeMutation();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [variant, setVariant] = useState<"success" | "danger">("danger");

  const [codeDigits, setCodeDigits] = useState(["", "", "", ""]);
  const inputRefs: React.RefObject<HTMLInputElement>[] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const formik = useFormik({
    initialValues: {
      code: "",
    },
    validationSchema: otpSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await validateCode({ code: values.code }).unwrap();
        setVariant("success");
        setStatusMsg(response.message || "Code validated. Proceeding...");
        localStorage.setItem("ziya-access", response?.token);

        setTimeout(() => {
          navigate("/auth/reset-password/change");
        }, 1500);
      } catch (error: any) {
        setVariant("danger");
        setStatusMsg(error?.data?.error || "Invalid code. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle single digit input update
  const handleChange = (value: string, index: number) => {
    const digits = [...codeDigits];
    digits[index] = value;
    setCodeDigits(digits);

    if (value && index < 3) inputRefs[index + 1].current?.focus();

    const joinedCode = digits.join("");
    formik.setFieldValue("code", joinedCode);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/media/logos/Ziya_logo_transparent_bg.png"
            className="mx-auto h-14 w-auto"
          />
        </div>

        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Enter the 4-digit Code
          </h3>

          {statusMsg && <Alert variant={variant}>{statusMsg}</Alert>}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-4">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleChange(e.target.value.slice(-1), index)
                  }
                  className={clsx(
                    "w-12 h-12 text-center text-lg border rounded-md focus:outline-none focus:ring-2",
                    {
                      "border-red-500 ring-red-200":
                        formik.errors.code && formik.touched.code,
                      "border-gray-300 ring-indigo-200": !formik.errors.code,
                    }
                  )}
                />
              ))}
            </div>

            <button
              type="submit"
              className={styles.btn}
              disabled={isLoading || formik.isSubmitting}
            >
              {isLoading || formik.isSubmitting
                ? "Please wait..."
                : "Verify Code"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Didn’t get a code?{" "}
            <a
              href="/auth/reset-password"
              className="text-indigo-600 font-medium hover:underline"
            >
              Resend
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ValidateCode };
