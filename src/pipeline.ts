/**
 * A step function that takes a context and returns a promise that resolves when the step is done.
 * @template Context The context type.
 * @param ctx The context.
 */
export type Step<Context> = (ctx: Context) => Promise<void>;

/**
 * A pipe that runs a series of steps in order.
 * @template Context The context type.
 */
export interface Pipe<Context> {
  /** The steps in the pipe. */
  readonly steps: ReadonlyArray<Step<Context>>;
  /**
   * Adds one or more steps to the pipe.
   * @param stepsAoAdd The steps to add.
   */
  add(...stepsAoAdd: Step<Context>[]): this;

  /**
   * Executes the pipe.
   * @param ctx The context.
   */
  run(ctx: Context): Promise<Context>;
}

/**
 * Creates a new pipeline.
 * @template Context The context type.
 * @param initialSteps The initial steps (optional).
 */
export function createPipeline<Context>(
  ...initialSteps: Step<Context>[]
): Pipe<Context> {
  const steps: Step<Context>[] = initialSteps;

  return {
    get steps() {
      return steps;
    },
    add(...stepsAoAdd) {
      steps.push(...stepsAoAdd);
      return this;
    },
    async run(ctx) {
      let i = 0;

      try {
        for (const step of steps) {
          await step(ctx);
          i++;
        }
      } catch (error) {
        throw new PipeError([error], this, i);
      }

      return ctx;
    },
  };
}

/**
 * An error that occurred during a pipe.
 */
export class PipeError<T = unknown> extends AggregateError {
  readonly name = "PipeError";
  /** The pipe that threw the error. */
  readonly pipe: Pipe<T>;
  /** The index of the step that threw the error. */
  readonly index: number;

  constructor(
    errors: unknown[],
    pipe: Pipe<T>,
    index: number,
    message = "Error in pipe",
  ) {
    super(errors, message);
    this.pipe = pipe;
    this.index = index;
  }

  /** The step that threw the error. */
  get step() {
    return this.pipe.steps[this.index];
  }
}
