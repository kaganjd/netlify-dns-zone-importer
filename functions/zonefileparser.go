package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"unicode/utf8"

	"github.com/kaganjd/gozone"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type NetlifyCreateDnsRecordBody struct {
	Type     string `json:"type"`
	Hostname string `json:"hostname"`
	Value    string `json:"value"`
	TTL      int64  `json:"ttl"`
}

type ParsedZoneFile struct {
	Origin  string                       `json:"name"`
	Records []NetlifyCreateDnsRecordBody `json:"records"`
}

func (p *ParsedZoneFile) SetOriginName(name string) {
	p.Origin = name
}

func (p *ParsedZoneFile) AddRecord(record NetlifyCreateDnsRecordBody) []NetlifyCreateDnsRecordBody {
	p.Records = append(p.Records, record)
	return p.Records
}

func trimLastRune(s string) string {
	r, size := utf8.DecodeLastRuneInString(s)
	if r == utf8.RuneError && (size == 0 || size == 1) {
		size = 0
	}
	return s[:len(s)-size]
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {

	var record gozone.Record

	p := ParsedZoneFile{
		Origin: "",
	}

	scanner := gozone.NewScanner(strings.NewReader(request.Body))

	for {
		err := scanner.Next(&record)
		if err != nil {
			fmt.Println("No next record")
			break
		}

		if p.Origin == "" {
			trimmedOrigin := trimLastRune(record.DomainName)
			p.SetOriginName(trimmedOrigin)
		}

		new := NetlifyCreateDnsRecordBody{
			Type:     record.Type.String(),
			Hostname: trimLastRune(record.DomainName),
			Value:    record.Data[0],
			TTL:      record.TimeToLive,
		}

		if new.Type != "SOA" {
			p.AddRecord(new)
		}
	}

	b, err := json.Marshal(p)
	if err != nil {
		return nil, err
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(b),
	}, nil
}

func main() {
	lambda.Start(handler)
}
