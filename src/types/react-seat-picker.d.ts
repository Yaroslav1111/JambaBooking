declare module "react-seat-picker" {
  import * as React from "react";

  export interface Seat {
    id?: string | number;
    number: string | number;
    isReserved?: boolean;
    tooltip?: string;
    orientation?: "east" | "west";
    [key: string]: any;
  }

  export interface SeatPickerProps {
    rows: Seat[][];
    maxReservableSeats?: number;
    alpha?: boolean;
    selectedByDefault?: string | number | null;
    addSeatCallback?: (
      props: { row: number; number: string | number; id?: string | number },
      addCb: (
        row: number,
        number: string | number,
        id?: string | number,
        cbData?: any
      ) => void
    ) => void;
    removeSeatCallback?: (
      props: { row: number; number: string | number; id?: string | number },
      removeCb: (row: number, number: string | number) => void
    ) => void;
    tooltipProps?: Record<string, any>;
    continuous?: boolean;
    renderSeat?: (props: any) => React.ReactNode;
  }

  export default class SeatPicker extends React.Component<SeatPickerProps> {}
}
