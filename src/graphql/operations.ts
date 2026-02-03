import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        role
      }
    }
  }
`;

export const SHIPMENTS_QUERY = gql`
  query Shipments(
    $pagination: PaginationInput!
    $filter: ShipmentFilterInput
    $sort: ShipmentSortInput
  ) {
    shipments(pagination: $pagination, filter: $filter, sort: $sort) {
      nodes {
        id
        referenceNumber
        shipperName
        carrierName
        pickupLocation
        deliveryLocation
        pickupDate
        deliveryDate
        status
        rateCents
        currency
        flagged
        updatedAt
      }
      totalCount
      page
      pageSize
      hasNextPage
    }
  }
`;

export const SHIPMENT_QUERY = gql`
  query Shipment($id: ID!) {
    shipment(id: $id) {
      id
      referenceNumber
      shipperName
      carrierName
      pickupLocation
      deliveryLocation
      pickupDate
      deliveryDate
      status
      rateCents
      currency
      flagged
      createdAt
      updatedAt
      trackingEvents {
        id
        status
        message
        location
        occurredAt
      }
    }
  }
`;

export const FLAG_SHIPMENT_MUTATION = gql`
  mutation FlagShipment($id: ID!, $flagged: Boolean!) {
    flagShipment(id: $id, flagged: $flagged) {
      id
      flagged
      updatedAt
    }
  }
`;

export const DELETE_SHIPMENT_MUTATION = gql`
  mutation DeleteShipment($id: ID!) {
    deleteShipment(id: $id)
  }
`;

export const UPDATE_SHIPMENT_MUTATION = gql`
  mutation UpdateShipment($id: ID!, $input: UpdateShipmentInput!) {
    updateShipment(id: $id, input: $input) {
      id
      shipperName
      carrierName
      pickupLocation
      deliveryLocation
      status
      rateCents
      currency
      flagged
      updatedAt
    }
  }
`;

export const ADD_SHIPMENT_MUTATION = gql`
  mutation AddShipment($input: CreateShipmentInput!) {
    addShipment(input: $input) {
      id
      referenceNumber
      shipperName
      carrierName
      pickupLocation
      deliveryLocation
      pickupDate
      deliveryDate
      status
      rateCents
      currency
      flagged
      updatedAt
    }
  }
`;
