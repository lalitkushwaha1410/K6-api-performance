import http from "k6/http";
import { authoringLoginUrl } from "./envrionments";

export function getLoginCookie(
  username: string,
  password: string
) {
  try {
    // @ts-ignore
    const jar = new http.CookieJar();

    const disPage = http.get(
      authoringLoginUrl,
      { jar }
    );

    // Click on "CHA" button
     const loginPage = disPage.clickLink({
      selector: 'div.col-md-12 > a[href]',
      params: { jar }
    }); 

    /* const loginPage = disPage.submitForm({
    submitSelector: 'span.badge bg-primary',
    params: { jar },
  } ); */

    // Insert login username and password
     const loginPageResponse = loginPage.submitForm({
      formSelector: "form",
      fields: {
        UserName: username,
        Password: password
      },
      submitSelector: '#submitButton',
      params: { jar }
    }); 

    let redirectResponse = loginPageResponse.submitForm({
      params: { jar }
    });

     redirectResponse = redirectResponse.submitForm(
      { params: { jar } }
    ); 

    return jar.cookiesForURL(redirectResponse.url)['aauth'][0];
  }
  catch (e) {
    console.error(e);
    console.error(`Could not log on user: ${username}`);
    return null;
  }
}
