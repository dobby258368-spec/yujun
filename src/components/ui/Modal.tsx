"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, Info, HelpCircle, X, Loader2 } from "lucide-react";

export type ModalType = "confirm" | "danger" | "success" | "error" | "info";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "confirm",
  confirmText = "確認",
  cancelText = "取消",
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />;
      case "confirm":
      default:
        return <HelpCircle className="h-6 w-6 text-blue-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "danger":
      case "error":
        return "bg-red-100";
      case "success":
        return "bg-emerald-100";
      case "info":
      case "confirm":
      default:
        return "bg-blue-100";
    }
  };

  const getConfirmBtnColor = () => {
    switch (type) {
      case "danger":
      case "error":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500";
      case "info":
      case "confirm":
      default:
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    }
  };

  const isAlert = type === "success" || type === "error" || type === "info";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100"
          >
            {/* Close X Button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${getIconBg()} flex-shrink-0`}>
                {getIcon()}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 leading-6">
                  {title}
                </h3>
                {description && (
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 flex flex-row-reverse gap-3">
              {isAlert ? (
                <button
                  type="button"
                  onClick={onConfirm || onClose}
                  className={`w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${getConfirmBtnColor()}`}
                >
                  我知道了
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={onConfirm}
                    className={`w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${getConfirmBtnColor()}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        處理中...
                      </>
                    ) : (
                      confirmText
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={onClose}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 focus:outline-none disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
