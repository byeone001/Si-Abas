/**
 * Helper untuk integrasi WhatsApp menggunakan API Fonnte.
 * Pastikan VITE_FONNTE_TOKEN ada di .env
 */

export const sendWhatsAppNotification = async (phoneNumber: string, message: string) => {
  const token = import.meta.env.VITE_FONNTE_TOKEN;
  
  if (!token) {
    console.warn("WhatsApp Token tidak ditemukan. Lewati pengiriman pesan.");
    return { success: false, message: "Token missing" };
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: new URLSearchParams({
        'target': phoneNumber,
        'message': message,
      })
    });

    const result = await response.json();
    console.log("Fonnte Response:", result);
    return result;
  } catch (error) {
    console.error("WhatsApp Error:", error);
    return { success: false, error };
  }
};
