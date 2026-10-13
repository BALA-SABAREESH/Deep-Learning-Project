"""
Ultralytics YOLO Training Script for Helmet and Safety Equipment Detection.
Trains a custom YOLOv8 model on PPE datasets (Roboflow Construction PPE, SHWD, etc.).
"""

import os
import argparse
import shutil
from ultralytics import YOLO


def parse_args():
    parser = argparse.ArgumentParser(description="Train custom YOLO model for PPE compliance.")
    parser.add_argument(
        "--data",
        type=str,
        default="dataset.yaml",
        help="Path to dataset YAML file",
    )
    parser.add_argument(
        "--weights",
        type=str,
        default="yolov8n.pt",
        help="Base pretrained YOLO weights (yolov8n.pt, yolov8s.pt, yolov8m.pt)",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=50,
        help="Number of training epochs",
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help="Batch size (adjust based on GPU/CPU RAM)",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Input image resolution",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="0",
        help="Device to run on (e.g. '0' for CUDA GPU, 'cpu' for CPU)",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="ppe_safety_model",
        help="Experiment name for runs/detect/<name>",
    )
    parser.add_argument(
        "--export-dir",
        type=str,
        default="../backend/weights",
        help="Target folder to copy trained best.pt",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    print("=" * 60)
    print("      HELMET & SAFETY EQUIPMENT DETECTION TRAINING")
    print("=" * 60)
    print(f"Base Weights : {args.weights}")
    print(f"Dataset      : {args.data}")
    print(f"Epochs       : {args.epochs}")
    print(f"Batch Size   : {args.batch}")
    print(f"Resolution   : {args.imgsz}")
    print(f"Device       : {args.device}")
    print("=" * 60)

    # 1. Load pretrained YOLO model
    model = YOLO(args.weights)

    # 2. Train on custom PPE dataset
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=args.device,
        name=args.name,
        patience=15,
        save=True,
        plots=True,
        workers=4,
    )

    print("\nTraining completed successfully!")

    # 3. Validate model
    print("\nEvaluating model on validation split...")
    metrics = model.val()
    print(f"mAP@50    : {metrics.box.map50:.4f}")
    print(f"mAP@50-95 : {metrics.box.map:.4f}")

    # 4. Copy best weights to backend/weights
    best_weights = os.path.join("runs", "detect", args.name, "weights", "best.pt")
    if os.path.exists(best_weights):
        os.makedirs(args.export_dir, exist_ok=True)
        dest_path = os.path.join(args.export_dir, "ppe_best.pt")
        shutil.copyfile(best_weights, dest_path)
        print(f"\n[+] Exported optimal weights to: {dest_path}")
        print("Backend will automatically load this model upon next restart!")
    else:
        print(f"\n[!] Note: best weights found at standard run directory: {best_weights}")


if __name__ == "__main__":
    main()
