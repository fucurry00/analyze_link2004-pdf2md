"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Translations } from "../lib/i18n";

type UploadResultProps = {
  uploadResult: {
    success: boolean;
    url?: string;
    fileType?: "pdf" | "image";
    errorMessage?: string;
  } | null;
  analyzing: boolean;
  onAnalyze: () => void;
  translations: Translations;
};

export default function UploadResult({
  uploadResult,
  analyzing,
  onAnalyze,
  translations,
}: UploadResultProps) {
  if (!uploadResult) return null;

  // エラー表示の場合
  if (!uploadResult.success) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {translations.uploadErrorTitle}
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p>
                  {translations.uploadError}
                  {uploadResult.errorMessage ? `: ${uploadResult.errorMessage}` : ""}
                </p>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {translations.tryAgain}
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
                >
                  {translations.cancel}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // 成功表示の場合
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <motion.svg
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-6 w-6 text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </motion.svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              {translations.uploadSuccessTitle}
            </h3>
            <div className="mt-1 text-sm text-green-700">
              <p>
                {uploadResult.fileType === "image"
                  ? translations.uploadSuccessMessageImage
                  : translations.uploadSuccessMessagePdf}
              </p>
            </div>
            {uploadResult.url && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={uploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none transition-colors"
                >
                  <svg
                    className="mr-1.5 h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  {translations.openPdf}
                </a>

                <button
                  onClick={onAnalyze}
                  disabled={analyzing}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md
                    ${
                      analyzing
                        ? "text-gray-500 bg-gray-200 cursor-not-allowed"
                        : "text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none transition-colors"
                    }
                  `}
                >
                  {analyzing ? (
                    <>
                      <svg
                        className="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {translations.analyzing}
                    </>
                  ) : (
                    <>
                      <svg
                        className="mr-1.5 h-3 w-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      {translations.analyzeWithAI}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
