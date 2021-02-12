let db;
// create a new db request for a "budget" database. then number after the name of the database is the version number
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  request.result.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(request.error);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access - pending is the name of the objectStore
  const transaction = db.transaction(["pending"], "readwrite");
  // const transactions = db.transaction(??)
  // access your pending object store
  // add record to your store with add method.
  const pendingStore = transaction.objectStore("pending");

  pendingStore.add(record);

}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const pendingStore = transaction.objectStore("pending");
  // get all records from store and set to a variable
  // const getAll = ??
  const getAll = pendingStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          // access your pending object store
          const clearTx = db.transaction(["pending"], "readwrite");
          // clear all items in your store
          clearTx.objectStore("pending").clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
window.addEventListener('ofline', checkDatabase);