// All landing page server actions should be defined here.
"use client";
import axios from "axios";
import { useState } from "react";

export interface SendEmailParams {
  from: string;
  to: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  replyTo?: string[];
}

const useServerActions = () => {

    // all for email change later 
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const submitDemoForm = async (sendEmailParams: SendEmailParams) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(process.env.NEXT_PUBLIC_EMAIL_API_URL!, sendEmailParams);
            if (response.status === 200) {
                setEmailSent(true);
            } else {
                throw new Error("Failed to send email. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            
        } finally {
            setLoading(false);
        }
  };

  return { submitDemoForm, emailSent, error, loading };
}

export default useServerActions;