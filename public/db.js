let db;

//creates new indexedDB called "budget"
const request = window.indexedDB.open("budget", 1);

//runs checkDatabase when device is online
request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkRecords();
  };
  console.log("IndexedDB opened.")
};

//error handling
request.onerror = function(event) {
  alert("Error! Check console.")
  console.log("Error: " + event.target.errorCode);
};

//creates objectStore for pending transactions entered offline
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pendingTransactions", { autoIncrement: true });
};

//saves records 
function saveRecord(record) {
  const transaction = db.transaction("pendingTransactions", "readwrite");

  transaction.objectStore("pendingTransactions").add(record);
};

//checks all records
function checkRecords() {
  const transaction = db.transaction("pendingTransactions", "readwrite");

  const allRecords = transaction.objectStore("pendingTransactions").getAll();

  allRecords.onsuccess = function() {
    if (allRecords.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(allRecords.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        //code to clear objectStore
        const transaction = db.transaction("pendingTransactions", "readwrite");

        transaction.objectStore("pendingTransactions").clear();
      });
    };
  };
};

//listens for connection
window.addEventListener("online", checkRecords);