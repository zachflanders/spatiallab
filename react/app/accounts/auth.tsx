export async function checkAuth() {
  try {
    const response = await fetch('/api/accounts/is_authenticated/');
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      return data.is_authenticated;
    }
  } catch (error) {
    console.error('There was an error checking authentication:', error);
    return false;
  }
}

export const logout = async () => {
  console.log('logging out');
  try {
    const response = await fetch('/api/accounts/logout/');
    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.error('There was an error logging out:', error);
    return false;
  }
};

export function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
