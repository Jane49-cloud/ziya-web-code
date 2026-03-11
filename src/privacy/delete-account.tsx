// AccountDeletion.tsx
import React from "react";
import {
  FiShield,
  FiMail,
  FiPhone,
  FiAlertCircle,
  FiClock,
  FiFileText,
} from "react-icons/fi";

const SUPPORT_EMAIL = "itsupport@ziya.co.ke";
const SUPPORT_PHONE = "+254791055992"; // tel needs international format

const AccountDeletion: React.FC = () => {
  const subject = encodeURIComponent("Account Deletion Request – Ziya App");
  const body = encodeURIComponent(
    [
      "Hello Ziya Support,",
      "",
      "I would like to request deletion of my account and associated personal data.",
      "",
      "My details:",
      "- Full name:",
      "- Phone number (used to log in):",
      "- Email (used to log in):",
      "- Reason for deletion (optional):",
      "",
      "I understand this action is irreversible and acknowledge that certain records may be retained where legally required.",
      "",
      "Thank you.",
    ].join("\n")
  );

  const emailHref = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  const telHref = `tel:${SUPPORT_PHONE}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <section className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiShield className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Request Account Deletion
              </h1>
              <p className="text-sm text-slate-600">
                Ziya respects your privacy. Use the options below to request
                deletion of your account and personal data.
              </p>
            </div>
          </div>
        </header>

        {/* Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <a
            href={emailHref}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FiMail className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium text-slate-900">
                Email {SUPPORT_EMAIL}
              </div>
              <div className="text-sm text-slate-600">
                Opens pre-filled email with required details
              </div>
            </div>
          </a>

          <a
            href={telHref}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FiPhone className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium text-slate-900">
                Call 0791 055 992
              </div>
              <div className="text-sm text-slate-600">
                Mon–Fri, 9:00–17:00 EAT
              </div>
            </div>
          </a>
        </div>

        {/* What to include */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FiFileText className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">
              What to include in your request
            </h2>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            <li>Full name</li>
            <li>Phone number used to log in</li>
            <li>Email address used to log in</li>
            <li>Optional: reason for deletion</li>
          </ul>
        </div>

        {/* Verification & SLA */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FiClock className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">
              Verification & timelines
            </h2>
          </div>
          <p className="text-sm leading-6 text-slate-700">
            For your security, we may verify your request via the email or phone
            on your account. We aim to confirm and complete deletion within{" "}
            <span className="font-medium">7–14 days</span> of receiving a valid
            request.
          </p>
        </div>

        {/* Irreversibility & retention */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="mb-2 flex items-center gap-2 text-amber-800">
            <FiAlertCircle className="h-5 w-5" />
            <h2 className="text-base font-semibold">Important</h2>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-amber-900">
            <li>Deletion is permanent and cannot be undone.</li>
            <li>
              We may retain limited records where legally required (e.g., fraud
              prevention, accounting). See our{" "}
              <a
                href="https://admin.ziya.co.ke/privacy-policy"
                className="font-medium underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </a>{" "}
              for details.
            </li>
          </ul>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Ziya Limited • Data deletion per Kenya
          Data Protection Act, 2019.
        </p>
      </section>
    </main>
  );
};

export default AccountDeletion;
