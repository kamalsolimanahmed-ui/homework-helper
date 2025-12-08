import { useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [homeworkText, setHomeworkText] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    if (!homeworkText.trim()) {
      alert("❌ Please enter homework text!");
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Sending to /api/scan...");

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: homeworkText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ Error: " + (data.error || "Failed to process"));
        setLoading(false);
        return;
      }

      console.log("✅ Success! Storing result...");

      // Store result
      localStorage.setItem("homeworkResult", JSON.stringify(data));
      
      console.log("📍 Redirecting to /results...");
      router.push("/results");
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Error: " + error.message);
      setLoading(false);
    }
  }

  if (showInput) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">📝 Enter Homework</h2>
          
          <textarea
            value={homeworkText}
            onChange={(e) => setHomeworkText(e.target.value)}
            placeholder="Type or paste the homework problem here..."
            className="w-full p-3 border-2 border-yellow-400 rounded-lg mb-4 min-h-[150px] text-lg"
          />

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowInput(false);
                setHomeworkText("");
              }}
              className="flex-1 px-4 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "⏳ Processing..." : "✅ Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowInput(true)}
        disabled={loading}
        className="
          px-12 py-5
          bg-yellow-400 
          text-black 
          font-bold 
          rounded-full
          shadow-2xl 
          text-xl
          hover:bg-yellow-500 
          hover:scale-105
          disabled:opacity-50
          transition-all
          duration-200
          z-50
          relative
        "
      >
        {loading ? "⏳ Processing..." : "Homework Scan"}
      </button>
    </>
  );
}