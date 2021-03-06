const buildErrorMessage = error =>
  `There has been a problem with your fetch operation: ${error.message}`;

const fetchWithRaw = (cozyURL, token, action, type) =>
  window
    .fetch(`${cozyURL}/intents`, options(token)(action)(type))
    .then(getBody)
    .then(getData);

const options = token => action => type => ({
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "content-type": "application/json"
  },
  credentials: "include",
  body: JSON.stringify({
    data: {
      type: "io.cozy.intents",
      attributes: {
        action: action,
        type: type,
        data: {},
        permissions: []
      }
    }
  })
});

const getBody = response => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error("Network response was not ok.");
  }
};

const getData = result => {
  const {
    attributes,
    links,
    id: _id,
    meta: { rev: _rev },
    type: _type
  } = result.data;
  return {
    _id,
    _rev,
    _type,
    attributes,
    links,
    relations: function(n) {}
  };
};

const getCredentials = dataset => ({
  url: `//${dataset.cozyDomain}`,
  token: dataset.cozyToken
});

const displayInHTML = suggestions => {
  var results = document.getElementById("results");
  clearResults(results);
  suggestions.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item.title;
    results.appendChild(li);
  });
};

const clearResults = results => {
  while (results.firstChild) {
    results.removeChild(results.firstChild);
  }
};

export const messageHandler = event => {
  if (event.origin === "http://intents-dev.cozy.tools:8080") {
    console.log("internal message received");
  } else if (event.origin === "http://drive.cozy.tools:8080") {
    if (event.data.type.includes(":ready")) {
      console.log("intents is ready");
    } else if (event.data.type.includes(":data")) {
      console.log(`here are the results`, event.data);
      displayInHTML(event.data.suggestions);
    }
  }
};

export const catchError = error => {
  console.error(buildErrorMessage(error));
};

export const createTargetWindow = (url, slug) => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", url);
  iframe.setAttribute("style", "display: none");
  iframe.onload = function(event) {
    console.log(`iframe ${slug} is loaded`);
  };
  document.getElementById("iframes").appendChild(iframe);
  return iframe.contentWindow;
};

export const createQuery = query => ({ query });

export const fetchRawIntents = dataset => {
  const data = getCredentials(dataset);
  return fetchWithRaw(data.url, data.token, "OPEN", "io.cozy.suggestions");
};

export const value = event => event.target.value;
