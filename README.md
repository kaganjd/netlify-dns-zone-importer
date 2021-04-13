# Netlify zone file importer

0. Go to https://gallant-leavitt-d4e050.netlify.app/
1. Log in with Netlify
2. Upload your zone file
3. Create a DNS zone for your origin domain
4. Create DNS records

## What's a zone file?

There are many examples scattered across the internet. Here's one:

```
$ORIGIN flowers.horse.
@                      3600 SOA   ns1.p30.dynect.net. (
                              zone-admin.dyndns.com.     ; address of responsible party
                              2016072701                 ; serial number
                              3600                       ; refresh period
                              600                        ; retry period
                              604800                     ; expire time
                              1800                     ) ; minimum ttl
		      86400 NS    ns1.p30.dynect.net.
                      86400 NS    ns2.p30.dynect.net.
                      86400 NS    ns3.p30.dynect.net.
                      86400 NS    ns4.p30.dynect.net.
                       3600 MX    10 mail.flowers.horse.
                       3600 MX    20 vpn.flowers.horse.
                       3600 MX    30 mail.flowers.horse.
                         60 A     204.13.248.106
                       3600 TXT   "v=spf1 includespf.dynect.net ~all"
mail                  14400 A     204.13.248.106
vpn                      60 A     216.146.45.240
webapp                   60 A     216.146.46.10
webapp                   60 A     216.146.46.11
www                   43200 CNAME flowers.horse.
```

This app expects you to upload a .txt file, so if your zone file doesn't have an extension, you'll need to add .txt to the end.

## What about my SOA record?

Netlify doesn't support creating SOA records, so the app won't show you an SOA record even if it was in the zone file.

## What about this [silent failure, weird UI thing, unhandled case]?

There are many! This is a work in progress. Please file an issue and I'll take a look :)

### Thanks

- @futuregerald for guidance
- Zone file parsing: https://github.com/wpalmer/gozone (my fork with a bug fix: https://github.com/kaganjd/gozone)
- OAuth: https://github.com/netlify-labs/oauth-example
- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
