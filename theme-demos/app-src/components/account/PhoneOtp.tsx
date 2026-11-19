"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Phone + OTP using the BinGi Marketplace guest account.
 * DEMO: no SMS is sent; any 6 digits verify. Production: Marketplace OTP API.
 */
export function PhoneOtp({ onVerified, initialPhone = "" }: { onVerified: (phone: string) => void; initialPhone?: string }) {
  const [phone, setPhone] = useState(initialPhone);
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const digits = phone.replace(/\D/g, "");
  const valid = /^0?1[3-9]\d{8}$/.test(digits.replace(/^880/, ""));
  const display = `+880 ${digits.replace(/^880/, "").replace(/^0/, "")}`;

  if (step === "done")
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-[15px] font-semibold text-emerald-800">
        <CheckCircle2 className="size-5" /> {display} verified
      </p>
    );

  return (
    <div>
      {step === "phone" ? (
        <>
          <label className="block text-sm font-semibold" htmlFor="otp-phone">Mobile number</label>
          <div className="mt-1.5 flex gap-2">
            <span className="flex h-12 items-center rounded-2xl border border-line bg-canvas px-3 text-[15px] font-semibold">+880</span>
            <input
              id="otp-phone"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="17XX-XXXXXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErr("");
              }}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 text-[16px] outline-none focus:border-action"
            />
          </div>
          {err && <p className="mt-1.5 text-sm text-red-700">{err}</p>}
          <Button type="button" className="mt-3 w-full sm:w-auto" onClick={() => (valid ? setStep("code") : setErr("Enter a valid Bangladesh mobile number"))}>
            Send code
          </Button>
        </>
      ) : (
        <>
          <label className="block text-sm font-semibold" htmlFor="otp-code">Code sent to {display}</label>
          <input
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              setErr("");
            }}
            className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-center text-xl tracking-[0.4em] outline-none focus:border-action sm:w-56"
          />
          <p className="mt-1.5 text-[13px] text-muted">Preview build: no SMS is sent — enter any 6 digits.</p>
          {err && <p className="mt-1 text-sm text-red-700">{err}</p>}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              onClick={() => {
                if (code.length !== 6) return setErr("Enter the 6-digit code");
                setStep("done");
                onVerified(display);
              }}
            >
              Verify
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep("phone")}>Change number</Button>
          </div>
        </>
      )}
    </div>
  );
}
