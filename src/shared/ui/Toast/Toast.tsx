import "./Toast.css";

export function Toast({ message }: { message: string }) {
  return (
    <p className="toast" role="status">
      {message}
    </p>
  );
}
