# HDS Data Model Drafting space

Defines the initial version of stream structures and event types for a common model for HDS data points. 

## Functional Requirements Specifications

| Date             | 27th May 2025 |
| ---------------- | ------------- |
| Document Version | 0.1           |
| Status           | Draft         |
|                  |               |

### Dev & Roadmap 

Base Logic - metrics, observation, all about patien data 

- [ ] Choose JSON or YAML
- [ ] Write JsonScheams and validate with [ajv](https://github.com/ajv-validator/ajv)
- [ ] Experiment **toFhir** & **fromFhir**  logics 
- [ ] Experiment conversion logic (from one eventType to another wihin an "Item")
- [ ] Experiment model versioning 

Specific Logic

- [ ] Access ClientData
  - [ ] Properties for contact informations (type, address, ... ,url)
  - [ ] Properties for supported interactions
    - [ ] A `chat stream` when the counter part supports chats


### Function Requirements

#### Description

HDS should provide a comprehensive set of tools to identify and encode medical and life data in a common data model. 

These tools should be used by digital applications and processes to input and output data from HDS.

#### Streams & eventTypes

Based on Pryv software, all observations & information are encoded as `events`  with one `eventType` determining the **type** of data and at least one `streamId`  giving the **context**.

This logic needs to be completed for HDS to facilitate the encoding and representation of information in forms, graphs, tables and for data aggregation and processing.

#### Items

An item definition should give enough information to perform the following:

Note: all textual descriptions and labels should be translatable. market with a (t)

- basics
  - identify an observation or information, e.g. Body Weight
  - has a label (t)
  - has a description (t)
  - has a unique identifier
  - has at least one eventType
  - has at least one streamId
- Constraints & checks
  The eventType(s) will already provide some constraints, such as "number" or "object stucture" based on jsonSchema. This may not be sufficient and could be completed on a per eventType basis.

- Encoding in standards and variations
  - Some data may be taken with different variations and context
  - [SNOWMED CT](https://bioportal.bioontology.org/ontologies/SNOMEDCT)
  - [LOINC (BODY WEIGHT)](https://loinc.org/LG34372-9)
  
- Source of the data
  The origin of the data will be given by `createdBy` and `modifiedBy` . Still this may not be sufficient 
- HL7Fhir transformation 
  HL7Fhir is a standard widely used to exchange medical and observation data. HDS items should support as much as possible conversion from and to HL7Fhir. The transformation information should be stored in these definitions and in the related events and streams.
  - [HL7 US](https://hl7.org/fhir/us/)
  - [HL7 CH](https://www.fhir.ch)
- Displaying the information
  An Item should provide the necessary information for applications to display it in a unified way.
  - Forms
    - Numbers
    - Text input
      - Short
      - Long
    - Date 
      - Day only
      - Year only
      - ....
    - Select with Ids and Labels
  - Graphs & Aggregation
    - Some data may be displayed as a graph
    - May provide aggregation information: sum  of steps, average for temperature

- versioning
  - has a version
  - provides necessary information to transform the data to the latest version


**Example Weight**
```yaml
body-weight
  label: 
    en: Body Weight
  description:
    en: Body weight of a human being
  streamId: body-weight # the parents structures of streams is given by the default streams structure
  eventTypes: 
    - mass/kg
    - mass/lb
  variations:
    default:
      label: 
        en: Default
      description: 
        en: Measured with an instrument
      encoding:
        loinc: 29463-7
        snowmed: 27113001 # Many other exists
    self-reported:
      label: 
        en: Self reported
      description: 
        en: Weight self reported
      encoding:
        loinc: 79348-9
        snowmed: 784399000
    with-clothes:
      label:
        en: Measured with clothes
      encoding:
        loinc: 8350-1
        hl7:
          extension: # snowmed as no specific code by provide extension
            - url: http://hl7.org/fhir/us/vitals/StructureDefinition/AssociatedSituationExt

  constraints:
    mass/kg:
      number: 
        min: 0
    mass/lb:
        min: 0
  conversion: # Conversion are handled by eventTypes, they are bi-drectionnal
    byEventType: true
  display:
    unit: # Per event Type
      mass/kg: Kg
      mass/lb: Lbs
    input:
      type: number
    table:
      round: -2 # Will perform round(x*10^-round)*10^round  
    graph:
      type: lines
      aggregation: none
  repeatable: any # 
  hl7fhir:
    resourceType: Observation
    meta:
      profile:
        - http://hl7.org/fhir/us/vitals/StructureDefinition/body-weight
      category-default: vital-sign # category shortcurt
    valueQuantity:
      value: "{event.content}"
      system: http://unitsofmeasure.org
    byEventType:
      mass/kg:
        unit: kg
        code: kg
      mass/lb:
        unit: lb
        code: "[lb_av]"

```

