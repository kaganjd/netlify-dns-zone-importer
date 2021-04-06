package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kaganjd/gozone"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var ntlApiDnsZonesBaseUrl = "https://api.netlify.com/api/v1/dns_zones"

type NetlifyCreateDnsRecordBody struct {
	Type     string `json:"type"`
	Hostname string `json:"hostname"`
	Value    string `json:"value"`
	TTL      int64  `json:"ttl"`
}

type NetlifyCreateDnsZoneBody struct {
	AccountSlug string `json:"account_slug"`
	Name        string `json:"name"`
}

type NetlifyCreateDnsZoneSuccessResponse struct {
	ZoneId               string      `json:"id,omitempty"`
	Name                 string      `json:"name,omitempty"`
	Errors               interface{} `json:"errors,omitempty"`
	SupportedRecordTypes []string    `json:"supported_record_types,omitempty"`
	UserId               string      `json:"user_id,omitempty"`
	CreatedAt            string      `json:"created_at,omitempty"`
	UpdatedAt            string      `json:"updated_at,omitempty"`
	Records              []string    `json:"records,omitempty"`
	DnsServers           []string    `json:"dns_servers,omitempty"`
	AccountId            string      `json:"account_id,omitempty"`
	SiteId               string      `json:"site_id,omitempty"`
	AccountSlug          string      `json:"account_slug,omitempty"`
	AccountName          string      `json:"account_name,omitempty"`
	IpV6                 string      `json:"ipv6_enabled,omitempty"`
	Dedicated            string      `json:"dedicated,omitempty"`
}

type NetlifyFunctionRequestBody struct {
	Payload *NtlPayloadMap         `json:"payload",omitempty`
	X       map[string]interface{} `json:"-"`
}

type NtlPayloadMap struct {
	Data *NtlDataMap            `json:"data",omitempty`
	X    map[string]interface{} `json:"-"`
}

type NtlDataMap struct {
	Zone *NtlZoneMap            `json:"zone",omitempty`
	X    map[string]interface{} `json:"-"`
}

type NtlZoneMap struct {
	Url string                 `json:"url",omitempty`
	X   map[string]interface{} `json:"-"`
}

func (n *NetlifyCreateDnsZoneBody) SetName(name string) {
	n.Name = name
}

func trimLastRune(s string) string {
	r, size := utf8.DecodeLastRuneInString(s)
	if r == utf8.RuneError && (size == 0 || size == 1) {
		size = 0
	}
	return s[:len(s)-size]
}

func ntlNewPostRequest(endpoint string, reqBody []byte) ([]byte, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", "Bearer "+os.Getenv("NETLIFY_PAT"))
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	} else if res.StatusCode != 201 {
		fmt.Println("Netlify API response is not 201: %s", res)
	}
	defer res.Body.Close()
	return ioutil.ReadAll(res.Body)
}

func getZoneFile(path string) ([]byte, error) {
	res, err := http.Get(path)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	return ioutil.ReadAll(res.Body)
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	var z *NetlifyFunctionRequestBody
	decoder := json.NewDecoder(strings.NewReader(request.Body))
	z = &NetlifyFunctionRequestBody{}
	decodeErr := decoder.Decode(z)
	if decodeErr != nil {
		return nil, decodeErr
	}

	var record gozone.Record
	var n *NetlifyCreateDnsZoneSuccessResponse

	origin := NetlifyCreateDnsZoneBody{
		AccountSlug: os.Getenv("ACCOUNT_SLUG"),
		Name:        "",
	}

	resBody, reqErr := getZoneFile(z.Payload.Data.Zone.Url)
	if reqErr != nil {
		return nil, reqErr
	}

	scanner := gozone.NewScanner(bytes.NewReader(resBody))

	for {
		err := scanner.Next(&record)
		if err != nil {
			break
		}

		if origin.Name == "" {
			trimmedOrigin := trimLastRune(record.DomainName)
			origin.SetName(trimmedOrigin)
			b, marshalErr := json.Marshal(origin)
			if marshalErr != nil {
				return nil, marshalErr
			}

			resBody, reqErr := ntlNewPostRequest(ntlApiDnsZonesBaseUrl, b)
			if reqErr != nil {
				return nil, reqErr
			}

			decoder := json.NewDecoder(bytes.NewReader(resBody))
			n = &NetlifyCreateDnsZoneSuccessResponse{}
			decodeErr := decoder.Decode(n)
			if decodeErr != nil {
				return nil, decodeErr
			}
		}

		ntlRecord := NetlifyCreateDnsRecordBody{
			Type:     record.Type.String(),
			Hostname: trimLastRune(record.DomainName),
			Value:    record.Data[0],
			TTL:      record.TimeToLive,
		}

		if ntlRecord.Type != "SOA" {
			b, marshalErr := json.Marshal(ntlRecord)
			if marshalErr != nil {
				return nil, marshalErr
			}

			path := fmt.Sprintf("%s/%s/dns_records", ntlApiDnsZonesBaseUrl, n.ZoneId)
			ntlNewPostRequest(path, b)
		}
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handler)
}
