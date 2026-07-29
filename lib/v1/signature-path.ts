export type NormalizedPoint = readonly [x: number, y: number];

export type BezierCurve = readonly [
  control1X: number,
  control1Y: number,
  control2X: number,
  control2Y: number,
  endX: number,
  endY: number,
];

export type Stroke = {
  readonly id: string;
  readonly start: NormalizedPoint;
  readonly curves: readonly BezierCurve[];
  readonly startsAtMs: number;
  readonly endsAtMs: number;
  readonly width: number;
};

export const signatureStrokes = [
  {
    id: "b",
    start: [0.085, 0.58],
    curves: [
      [0.09, 0.49, 0.095, 0.36, 0.105, 0.285],
      [0.112, 0.39, 0.105, 0.58, 0.125, 0.595],
      [0.145, 0.61, 0.19, 0.53, 0.176, 0.455],
      [0.164, 0.392, 0.126, 0.43, 0.125, 0.492],
      [0.124, 0.548, 0.16, 0.572, 0.205, 0.522],
    ],
    startsAtMs: 70,
    endsAtMs: 310,
    width: 0.012,
  },
  {
    id: "y-left",
    start: [0.205, 0.44],
    curves: [
      [0.215, 0.49, 0.222, 0.555, 0.242, 0.548],
      [0.262, 0.54, 0.277, 0.47, 0.288, 0.425],
    ],
    startsAtMs: 235,
    endsAtMs: 405,
    width: 0.011,
  },
  {
    id: "y-tail",
    start: [0.292, 0.43],
    curves: [
      [0.28, 0.515, 0.275, 0.64, 0.248, 0.698],
      [0.229, 0.74, 0.202, 0.725, 0.205, 0.682],
    ],
    startsAtMs: 365,
    endsAtMs: 535,
    width: 0.011,
  },
  {
    id: "j",
    start: [0.405, 0.315],
    curves: [
      [0.425, 0.298, 0.45, 0.297, 0.469, 0.308],
      [0.448, 0.322, 0.44, 0.338, 0.44, 0.385],
      [0.44, 0.455, 0.447, 0.565, 0.414, 0.606],
      [0.386, 0.641, 0.344, 0.61, 0.355, 0.565],
    ],
    startsAtMs: 410,
    endsAtMs: 650,
    width: 0.013,
  },
  {
    id: "i",
    start: [0.486, 0.438],
    curves: [
      [0.48, 0.484, 0.477, 0.546, 0.495, 0.568],
      [0.505, 0.58, 0.522, 0.558, 0.53, 0.535],
    ],
    startsAtMs: 555,
    endsAtMs: 690,
    width: 0.011,
  },
  {
    id: "i-dot",
    start: [0.496, 0.37],
    curves: [
      [0.499, 0.359, 0.51, 0.359, 0.512, 0.371],
      [0.513, 0.382, 0.5, 0.386, 0.496, 0.37],
    ],
    startsAtMs: 650,
    endsAtMs: 720,
    width: 0.014,
  },
  {
    id: "first-e",
    start: [0.524, 0.516],
    curves: [
      [0.557, 0.504, 0.58, 0.466, 0.568, 0.444],
      [0.555, 0.42, 0.524, 0.452, 0.532, 0.503],
      [0.539, 0.551, 0.579, 0.575, 0.614, 0.538],
    ],
    startsAtMs: 670,
    endsAtMs: 825,
    width: 0.011,
  },
  {
    id: "w",
    start: [0.608, 0.45],
    curves: [
      [0.614, 0.495, 0.615, 0.554, 0.637, 0.558],
      [0.656, 0.562, 0.668, 0.486, 0.673, 0.453],
      [0.675, 0.506, 0.679, 0.554, 0.701, 0.552],
      [0.723, 0.549, 0.735, 0.475, 0.74, 0.438],
    ],
    startsAtMs: 770,
    endsAtMs: 955,
    width: 0.011,
  },
  {
    id: "second-e",
    start: [0.738, 0.512],
    curves: [
      [0.768, 0.501, 0.791, 0.466, 0.78, 0.443],
      [0.768, 0.418, 0.74, 0.45, 0.747, 0.5],
      [0.754, 0.548, 0.793, 0.568, 0.825, 0.532],
    ],
    startsAtMs: 900,
    endsAtMs: 1055,
    width: 0.011,
  },
  {
    id: "n",
    start: [0.817, 0.522],
    curves: [
      [0.828, 0.49, 0.837, 0.451, 0.843, 0.432],
      [0.842, 0.483, 0.843, 0.54, 0.852, 0.552],
      [0.856, 0.513, 0.873, 0.438, 0.899, 0.443],
      [0.923, 0.449, 0.908, 0.523, 0.923, 0.548],
      [0.936, 0.57, 0.955, 0.544, 0.965, 0.516],
    ],
    startsAtMs: 1010,
    endsAtMs: 1180,
    width: 0.011,
  },
] as const satisfies readonly Stroke[];

export const checkmarkStroke = {
  id: "checkmark",
  start: [0.205, 0.565],
  curves: [
    [0.265, 0.585, 0.31, 0.655, 0.365, 0.692],
    [0.455, 0.57, 0.575, 0.42, 0.735, 0.31],
    [0.81, 0.26, 0.875, 0.245, 0.925, 0.275],
  ],
  startsAtMs: 1160,
  endsAtMs: 1530,
  width: 0.007,
} as const satisfies Stroke;
