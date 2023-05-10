## stream-fetch-processor

SSE - A Stream Fetch Processor for client

## Usage

```bash
# using yarn
yarn add stream-fetch-processor
```

```ts
import StreamFetchProcessor from 'StreamFetchProcessor';
const payload = {
  // ...
};
const sfp = new StreamFetchProcessor();

const response = await sfp.fetch(`url`, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
    Origin: '*',
  },
  method: 'POST',
  body: JSON.stringify(payload),
});

if (response.ok) {
  const result = sfp.read();
  for await (const data of await result) {
    const data = JSON.parse(data);
    console.log(data);
  }
}
```
