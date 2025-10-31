"use client";

import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState("+96181937847"); // Default phone number
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after page loads
    setIsVisible(true);
  }, []);

  const handleClick = () => {
    const message = encodeURIComponent("Hello! I'm interested in your products.");
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        .whatsapp-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: #25d366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
          animation: fadeIn 0.5s ease-out;
        }

        .whatsapp-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .whatsapp-button:active {
          transform: scale(0.95);
        }

        .whatsapp-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .whatsapp-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .whatsapp-button {
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
          }

          .whatsapp-icon {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
      <div className="whatsapp-button" onClick={handleClick} aria-label="Contact us on WhatsApp" role="button" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') handleClick(); }}>
        <div className="whatsapp-icon">
          <svg className="whatsapp-svg" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <circle cx="16" cy="16" r="16" fill="#25d366" />
            <path d="M24.11 19.44c-.34-.17-2.01-.99-2.32-1.1-.31-.12-.54-.18-.77.18-.22.34-.88 1.1-1.08 1.33-.2.23-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.7-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.05-2.55-.28-.67-.56-.58-.77-.59-.2-.01-.43-.01-.66-.01-.23 0-.6.09-.91.43-.31.34-1.2 1.18-1.2 2.89 0 1.71 1.23 3.36 1.4 3.6.17.23 2.41 3.75 5.85 5.26.82.36 1.45.57 1.95.73.82.26 1.57.23 2.16.14.66-.1 2.03-.81 2.32-1.59.29-.78.29-1.44.2-1.59-.09-.14-.31-.22-.66-.39zM16 28.5h-.01a11.5 11.5 0 01-5.86-1.61l-.42-.25-4.36 1.14 1.16-4.24-.28-.45A11.48 11.48 0 014.5 16C4.5 9.11 9.61 4 16.5 4c3.08 0 5.98 1.2 8.16 3.38A11.43 11.43 0 0128.5 16c0 6.89-5.11 12.5-12.5 12.5z" fill="#fff"/>
          </svg>
        </div>
      </div>
    </>
  );
}


