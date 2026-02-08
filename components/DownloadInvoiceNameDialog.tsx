'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface DownloadInvoiceNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customName: string) => void;
  defaultName: string;
}

export default function DownloadInvoiceNameDialog({
  isOpen,
  onClose,
  onConfirm,
  defaultName,
}: DownloadInvoiceNameDialogProps) {
  const tInvoice = useTranslations('invoice');
  const tCommon = useTranslations('common');
  const [fileName, setFileName] = useState(defaultName);

  // Update fileName when defaultName changes
  useEffect(() => {
    setFileName(defaultName);
  }, [defaultName]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fileName.trim()) {
      return;
    }

    onConfirm(fileName.trim());
    onClose();
  };

  const handleCancel = () => {
    setFileName(defaultName); // Reset to default on cancel
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[70]">
      <div className="relative top-1/3 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {tInvoice('downloadInvoice')}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            type="button"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="fileName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {tInvoice('fileName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fileName"
              name="fileName"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={tInvoice('enterFileName')}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              {tInvoice('fileNameHint')}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={!fileName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tInvoice('download')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
