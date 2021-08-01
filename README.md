# Forward Prismic Webhook 

Prismic does not allow adding custom values in body, 
but [GitHub repository dispatch event](https://docs.github.com/en/rest/reference/repos#create-a-repository-dispatch-event) need an `event_type` on it.  

This function forwards Prismic webhook to add an `event_type` in the body.

## How to use

1. Create function with this repo. 
2. Add webhook on Prismic.
- Url : 
```
  https://<your-function-url>?owner=<owner>&repository=<repository>&event_type=<event_type>
```
- Add Custom Header with your [GitHub PAT](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token): 
```
Authorization: token <GitHub PAT>
```
3. Inside your GitHub actions add `repository_dispatch` trigger. 
```
   on:
    repository_dispatch:
      types: ['<event_type>']
```

