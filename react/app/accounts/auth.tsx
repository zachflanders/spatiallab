export async function checkAuth() {
    try {
        const response = await fetch("/api/accounts/is_authenticated/");
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          return data.is_authenticated;
        }
      } catch (error) {
        console.error("There was an error checking authentication:", error);
        return false
      } 
      }

export const logout = async () => {
        console.log("logging out");
        try {
          const response = await fetch("/api/accounts/logout/");
          if (response.ok) {
            return true;
          }
        } catch (error) {
          console.error("There was an error logging out:", error);
            return false;
        }
      }