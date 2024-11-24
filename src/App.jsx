import { useEffect, useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState("");
  const [amount, setAmount] = useState();
  const [targetCurrencies, setTargetCurrencies] = useState([]);
  const [conversionResults, setConversionResults] = useState([]);
  console.log(conversionResults, "these are conversion result");
  const [selectedCurrecny, setSelectedCurrecny] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("currencyHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // yahn data filter kiya hai
  const filteredData = conversionResults.reStructData
    ?.filter((result) =>
      result.currency.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((result) => ({
      ...result,
      amount: parseFloat(result.amount).toFixed(3), // Show 3 decimal places
    }));
    const backendUrl = import.meta.env.NEXT_PUBLIC_BACKEND_URL;
    useEffect(() => {
    // Fetch the list of currencies when the component mounts
    fetch(`${backendUrl}/api/currencies`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then(({ data }) => {
        console.log(data);
        const reStructData = [];
        for (const [key, value] of Object.entries(data)) {
          console.log(`${key}: ${value}`);
          reStructData.push(value);
        }
        setTargetCurrencies(reStructData); // Assuming the response is an array of currencies
      })

      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    // Save the history to localStorage when the history changes
    localStorage.setItem("currencyHistory", JSON.stringify(history));
  }, [history]);

  const handleConvert = () => {
    setLoading(true);

    console.log("Sending request:", {
      base: baseCurrency,
      amount: amount,
    });

    fetch(`${backendUrl}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base: baseCurrency,
        amount: amount,
      }),
    })
      .then((res) => {
        console.log("Raw response: hai yea res ka", res);
        return res.json();
      })
      .then((data) => {
        console.log(data, "yeah ha data");

        setConversionResults(data); // Assuming data is an object with converted values
        setLoading(false);

        // Save this conversion in history
        setHistory((prevHistory) => [
          ...prevHistory,
          {
            baseCurrency,
            amount,
            conversionResults: data,
            date: new Date().toISOString(),
          },
        ]);
      })
      .catch((error) => {
        console.error("Error fetching conversion:", error);
        setLoading(false);
      });
  };

  return (
    <div className="container p-4 sm:p-6 md:w-1/2 lg:w-1/3 mx-auto">
      <div className="content">
        <div className="text-center">
          How Much are
          <br />
          <span className="mr-2">
            {amount} {baseCurrency}
            {" "}
          </span>
          in
          <span>{selectedCurrecny ? `: ${selectedCurrecny}` : "Convert"}</span>
        </div>
      </div>

      <div className="box mt-4 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <label
          htmlFor="base-currency"
          className="block text-sm font-medium mb-2"
        >
          Base currency
        </label>
        <select
          id="base-currency"
          value={baseCurrency}
          onChange={(e) => setBaseCurrency(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        >
          {targetCurrencies.length &&
            targetCurrencies.map((currency, index) => (
              <option key={index} value={currency.code}>
                {currency.symbol_native} {currency.code} - {currency.name}
              </option>
            ))}
        </select>

        <label htmlFor="amount" className="block text-sm font-medium mb-2">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={
            baseCurrency &&
            `${
              targetCurrencies.find((c) => c.code === baseCurrency)
                ?.symbol_native
            }`
          }
          className="w-full p-2 border rounded-md mb-4"
        />

        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full bg-pink-500 text-white py-2 rounded-md mt-2 hover:bg-pink-600 transition-all"
        >
          {loading ? "Converting..." : "CONVERT"}
        </button>

        <div className="mt-4">
          <div className="search-bar mb-4">
            <input
              type="text"
              placeholder="Search Currency"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
              className="w-full p-2 border rounded-md"
            />
          </div>

          <ul className="currency-list max-h-60 overflow-y-auto border rounded-md p-2">
            {filteredData?.length > 0 ? (
              filteredData.map((result, index) => (
                <li
                  key={index}
                  className="currency-item flex justify-between items-center p-2"
                >
                  <img
                    src={`flag-${result.currency}.png`}
                    alt={result.currency}
                    className="currency-flag w-6 h-6 mr-2"
                  />
                  <span
                    onClick={() =>
                      setSelectedCurrecny(
                        `${result.currency}, ${result.amount}`
                      )
                    }
                    className="cursor-pointer"
                  >
                    {conversionResults.base} {conversionResults.amount} -{" "}
                    {result.currency}: {result.amount}
                  </span>
                  <button
                    onClick={() => {
                      console.log(`Remove ${result.currency}`);
                    }}
                    className="ml-2 text-red-500"
                  >
                    X
                  </button>
                </li>
              ))
            ) : (
              <p>No currency data available.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
