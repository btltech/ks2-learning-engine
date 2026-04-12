import { useState, useEffect } from 'react';
import { progressVisualizationService, Certificate } from '../services/progressVisualizationService';

export default function CertificateGallery() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    setCertificates(progressVisualizationService.getCertificates());
  };

  const getBadgeColor = (level: Certificate['badgeLevel']) => {
    switch (level) {
      case 'bronze':
        return 'from-orange-300 to-orange-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      case 'gold':
        return 'from-yellow-300 to-yellow-600';
      case 'platinum':
        return 'from-purple-300 to-purple-600';
    }
  };

  const getBadgeEmoji = (level: Certificate['badgeLevel']) => {
    switch (level) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
    }
  };

  const handlePrint = (cert: Certificate) => {
    // Create printable version
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${cert.achievement}</title>
            <style>
              body {
                font-family: 'Georgia', serif;
                padding: 40px;
                text-align: center;
              }
              .certificate {
                border: 15px solid #8B4513;
                padding: 40px;
                max-width: 700px;
                margin: 0 auto;
                background: linear-gradient(135deg, #fff 0%, #f9f9f9 100%);
              }
              h1 {
                font-size: 48px;
                color: #2c5282;
                margin-bottom: 20px;
              }
              .badge {
                font-size: 72px;
                margin: 20px 0;
              }
              .achievement {
                font-size: 32px;
                font-weight: bold;
                margin: 20px 0;
                color: #333;
              }
              .subject {
                font-size: 24px;
                color: #666;
                margin: 10px 0;
              }
              .recipient {
                font-size: 28px;
                color: #2c5282;
                margin: 30px 0;
                font-style: italic;
              }
              .date {
                font-size: 18px;
                color: #999;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="certificate">
              <h1>🎓 Certificate of Achievement 🎓</h1>
              <div class="badge">${getBadgeEmoji(cert.badgeLevel)}</div>
              <div class="achievement">${cert.achievement}</div>
              <div class="subject">${cert.subject}</div>
              <div class="recipient">Awarded to: ${cert.recipient}</div>
              <div class="date">${new Date(cert.awardedDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = (cert: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate: ${cert.achievement}`,
        text: `I earned a ${cert.badgeLevel} certificate in ${cert.subject}! 🎉`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `I earned a ${cert.badgeLevel} certificate in ${cert.subject}! 🎉`
      );
      alert('Certificate info copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Certificate Gallery</h2>
        <p className="text-gray-600">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
        </p>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <p className="text-gray-600 mb-2">No certificates yet!</p>
          <p className="text-sm text-gray-500">
            Complete quizzes and master skills to earn certificates
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.certificateId}
              className="group cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <div
                className={`relative overflow-hidden rounded-xl border-4 border-gray-200 bg-gradient-to-br ${getBadgeColor(
                  cert.badgeLevel
                )} p-6 text-white shadow-lg transition-transform hover:scale-105`}
              >
                {/* Badge */}
                <div className="text-6xl mb-3 text-center">
                  {getBadgeEmoji(cert.badgeLevel)}
                </div>

                {/* Achievement */}
                <h3 className="text-lg font-bold text-center mb-2 line-clamp-2">
                  {cert.achievement}
                </h3>

                {/* Subject */}
                <p className="text-sm text-center opacity-90">{cert.subject}</p>

                {/* Date */}
                <p className="text-xs text-center opacity-75 mt-3">
                  {new Date(cert.awardedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white font-bold">View Certificate</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            {/* Certificate Display */}
            <div
              className={`relative bg-gradient-to-br ${getBadgeColor(
                selectedCert.badgeLevel
              )} p-12 text-white`}
            >
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white opacity-50"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-white opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white opacity-50"></div>

              {/* Content */}
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">🎓 Certificate of Achievement 🎓</h2>

                <div className="text-8xl my-6">{getBadgeEmoji(selectedCert.badgeLevel)}</div>

                <h3 className="text-3xl font-bold mb-4">{selectedCert.achievement}</h3>

                <p className="text-xl mb-6">{selectedCert.subject}</p>

                <div className="border-t-2 border-white/30 pt-4">
                  <p className="text-lg italic mb-2">This certificate is awarded to:</p>
                  <p className="text-2xl font-bold">{selectedCert.recipientName}</p>
                </div>

                <p className="text-sm mt-6 opacity-75">
                  {new Date(selectedCert.awardedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => handlePrint(selectedCert)}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => handleShare(selectedCert)}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                📤 Share
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
