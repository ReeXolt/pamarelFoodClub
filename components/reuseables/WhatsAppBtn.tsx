import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppBtn() {
	return (
		<a
			href="https://wa.me/+2349040498445"
			target="_blank"
			rel="noopener noreferrer"
			className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300 z-50 flex items-center justify-center"
			aria-label="Chat on WhatsApp"
		>
			<FaWhatsapp className="text-3xl" />
		</a>
	);
}
