import { useRef, useEffect } from "react";

const OTPInput = ({ otp, setOtp, length = 6 }) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    setOtp("".padStart(length, ""));
    inputsRef.current[0]?.focus();
  }, [length, setOtp]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    const key = e.key;
    if (key === "Backspace") {
      if (otp[index]) {
        const newOtp = otp.split("");
        newOtp[index] = "";
        setOtp(newOtp.join(""));
      } else if (index > 0) {
        const newOtp = otp.split("");
        newOtp[index - 1] = "";
        setOtp(newOtp.join(""));
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted.length === 0) return;

    const newOtp = otp.split("");
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
      inputsRef.current[i].value = pasted[i];
    }
    setOtp(newOtp.join(""));
    if (pasted.length < length) {
      inputsRef.current[pasted.length]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3 mt-4">
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            inputMode="numeric"
            pattern="\d{1}"
            className="w-12 h-12 md:w-14 md:h-14 text-center text-lg font-bold rounded-lg shadow-sm 
                       input input-bordered transition-colors focus:outline-none focus:ring-2 
                       focus:ring-primary focus:border-primary bg-base-100"
          />
        ))}
    </div>
  );
};

export default OTPInput;
