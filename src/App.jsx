import { useEffect, useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [amount, setAmount] = useState();
  const [currencies, setCurrencies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [convertedData, setConvertedData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const backendUrl =
    import.meta.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://smartcurrecnyconverter-backend-production.up.railway.app";

  useEffect(() => {
    fetch(`${backendUrl}/api/currencies`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status yahn hai 37: ${res.status}`);
        }
        return res.json();
      })
      .then(({ data }) => {
        const reStructData = [];
        for (const [_, value] of Object.entries(data)) {
          reStructData.push(value);
        }
        setCurrencies(reStructData); // yahn Assume krna hai curriency arry may ha
      })

      .catch((error) =>
        console.error("Error fetching data: yahn masla ha", error)
      );
  }, [backendUrl]);

  useEffect(() => {
    // save krna hai history may jb be localstorage change hoga
    const holdaValue = JSON.parse(localStorage.getItem("data"));
    if (holdaValue) {
      setAmount(holdaValue?.amount);
      setSelectedCurrency(holdaValue?.base);
      setConvertedData(holdaValue.reStructData);
    }
  }, []);

  const handleConvert = () => {
    setLoading(true);

    console.log("Sending request:", {
      base: selectedCurrency,
      amount: amount,
    });

    fetch(`${backendUrl}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base: selectedCurrency,
        amount: amount,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setConvertedData(data.reStructData);
        // setConversionResults(data); // Assuming kr rha hn data ko convert values may!
        setLoading(false);

        const localData = { ...data, date: new Date().toISOString() };
        localStorage.setItem("data", JSON.stringify(localData));
      })
      .catch((error) => {
        console.error("Error fetching conversion:", error);
        setLoading(false);
      });
  };

  return (
    <div className="container p-4 sm:p-6 md:w-1/2 lg:w-1/3 mx-auto">
      <div className="projectName">
        <p className="title">
          SMART <p className="title2">CURRENCY</p>
        </p>

        <p className="subtitle">CONVERTER</p>
      </div>

      <div className="content">
        <div className="text-center">
          How Much are
          <br />
          <span className="mr-2">
            {amount} {selectedCurrency}{" "}
          </span>
          in
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
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        >
          {currencies.length &&
            currencies.map((currency, index) => (
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
            selectedCurrency &&
            `${
              currencies.find((c) => c.code === selectedCurrency)?.symbol_native
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

        <div className="listing">
          <div className="search-bar mb-4">
            <input
              type="text"
              placeholder="Search Currency"
              value={searchQuery}
              onChange={(e) => {
                const filterData = convertedData?.filter((obj) =>
                  obj.currency
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase())
                );
                setFilterData(filterData);
                setSearchQuery(e.target.value);
              }}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <ul className="currency-list max-h-60 overflow-y-auto border rounded-md p-2">
            {searchQuery?.length
              ? filterData?.map((result, index) => (
                  <li
                    key={index}
                    className="currency-item flex justify-between items-center p-2"
                  >
                    <img
                      src={`flag-${result.currency}.png`}
                      alt={result.currency}
                      className="currency-flag w-6 h-6 mr-2"
                    />
                    <span className="cursor-pointer">
                      {result.currency}: {Number(result?.amount).toFixed(2)}
                    </span>
                  </li>
                ))
              : convertedData?.map((result, index) => (
                  <li
                    key={index}
                    className="currency-item flex justify-between items-center p-2"
                  >
                    <p>{result.symbol_native}</p>
                    <span
                      className="cursor-pointer"
                    >
                      {result.currency}: {Number(result?.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
