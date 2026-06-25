'use client';

import React, { useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';

interface ShareSheetProps {
  title: string;
  text: string;
  url: string;
  onClose?: () => void;
  onShare?: (channel: string) => void;
}

export function ShareSheet({ title, text, url, onClose, onShare }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const shareText = `${text} ${url}`;
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
      onShare?.('native');
    } catch (e) {
      // Aborted or unsupported — ignore
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      onShare?.('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const shareLinks: { id: string; label: string; icon: IconName; href: string }[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'message',
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: 'mail',
      href: `sms:?&body=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
      {canNativeShare && (
        <button
          onClick={handleNativeShare}
          className="w-full py-3.5 px-4 rounded-xl bg-neon-pink/20 border border-neon-pink/50 text-white font-bold hover:bg-neon-pink/30 transition-all flex items-center justify-center gap-2"
        >
          <Icon name="share" className="w-5 h-5" /> Partager nativement
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShare?.(link.id)}
            className="py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Icon name={link.icon} className="w-5 h-5" /> {link.label}
          </a>
        ))}
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
      >
        <Icon name={copied ? 'check' : 'link'} className="w-5 h-5" /> {copied ? 'Lien copié' : 'Copier le lien'}
      </button>

      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-500 text-sm hover:text-slate-300 transition-colors mt-1"
        >
          Annuler
        </button>
      )}
    </div>
  );
}
