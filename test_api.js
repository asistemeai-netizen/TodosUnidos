const apiKey = "rec_live_h84lt2XNM03FhxVXa41nYt8bHcuJJwePdSnxMZLhkXc";
const BASE_URL = 'https://desaparecidos-terremoto-api.theempire.tech/api/v1';

async function test() {
  try {
    const res = await fetch(`${BASE_URL}/listas`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      }
    });
    
    console.log('Status:', res.status, res.statusText);
    const body = await res.text();
    console.log('Body:', body.substring(0, 500));
  } catch(e) {
    console.error(e);
  }
}

test();
