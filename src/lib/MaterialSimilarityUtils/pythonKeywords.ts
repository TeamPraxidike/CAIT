export const pythonKeywords: Set<string> = new Set([
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
    'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
    'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
    'len', 'enumerate', 'print', 'np', 'plt', 'len', 'self',

    // numpy
    'numpy', 'array', 'arange', 'linspace', 'zeros', 'ones', 'empty', 'full', 'eye',
    'random', 'rand', 'randn', 'randint', 'seed',

    // pandas
    'pandas', 'pd', 'DataFrame', 'Series', 'read_csv', 'read_excel', 'to_csv', 'to_excel',

    // matplotlib
    'matplotlib', 'pyplot', 'plt', 'plot', 'figure', 'subplot', 'show', 'title', 'xlabel', 'ylabel', 'legend',

    // random
    'random', 'randrange', 'randint', 'choice', 'shuffle', 'uniform', 'seed',

    // scipy
    'scipy', 'sp', 'integrate', 'optimize', 'signal', 'sparse', 'spatial', 'stats',

    // scikit-learn
    'sklearn', 'svm', 'datasets', 'model_selection', 'metrics', 'linear_model', 'neighbors', 'preprocessing',

    // tensorflow
    'tensorflow', 'tf', 'keras', 'Sequential', 'Dense', 'Conv2D', 'MaxPooling2D', 'Flatten', 'compile', 'fit', 'evaluate', 'predict',

    // keras
    'keras', 'Sequential', 'Dense', 'Conv2D', 'MaxPooling2D', 'Flatten', 'compile', 'fit', 'evaluate', 'predict',

    // seaborn
    'seaborn', 'sns', 'load_dataset', 'relplot', 'catplot', 'distplot', 'heatmap',

    // pytorch
    'torch', 'nn', 'Tensor', 'autograd', 'optim', 'utils', 'data',
    'tensor', 'from_numpy', 'rand', 'randn', 'arange', 'zeros', 'ones', 'eye', 'full',
    'linspace', 'logspace', 'reshape', 'permute', 'transpose', 'flatten', 'cat', 'stack',
    'split', 'chunk', 'index_select', 'masked_select', 'gather', 'scatter', 'clone', 'detach',
    'to', 'cpu', 'cuda', 'device', 'save', 'load', 'no_grad', 'enable_grad', 'set_grad_enabled',
    'random_split', 'backward', 'grad',

    // built-in functions
    'abs', 'delattr', 'hash', 'memoryview', 'set', 'all', 'dict', 'help', 'min', 'setattr',
    'any', 'dir', 'hex', 'next', 'slice', 'ascii', 'divmod', 'id', 'object', 'sorted',
    'bin', 'enumerate', 'input', 'oct', 'staticmethod', 'bool', 'eval', 'int', 'open', 'str',
    'breakpoint', 'exec', 'isinstance', 'ord', 'sum', 'bytearray', 'filter', 'issubclass', 'pow',
    'super', 'bytes', 'float', 'iter', 'print', 'tuple', 'callable', 'format', 'len', 'property',
    'type', 'chr', 'frozenset', 'list', 'range', 'vars', 'classmethod', 'getattr', 'locals',
    'repr', 'zip', 'compile', 'globals', 'map', 'reversed', '__import__', 'complex', 'hasattr', 'max',
    'round', 'copyright', 'credits', 'exit', 'license', 'quit',

    // errors and exceptions
    'BaseException', 'Exception', 'ArithmeticError', 'BufferError', 'LookupError',
    'AssertionError', 'AttributeError', 'EOFError', 'FloatingPointError', 'GeneratorExit',
    'ImportError', 'ModuleNotFoundError', 'IndexError', 'KeyError', 'KeyboardInterrupt',
    'MemoryError', 'NameError', 'NotImplementedError', 'OSError', 'OverflowError',
    'RecursionError', 'ReferenceError', 'RuntimeError', 'StopIteration', 'SyntaxError',
    'IndentationError', 'TabError', 'SystemError', 'SystemExit', 'TypeError', 'UnboundLocalError',
    'UnicodeError', 'UnicodeEncodeError', 'UnicodeDecodeError', 'UnicodeTranslateError', 'ValueError',
    'ZeroDivisionError', 'EnvironmentError', 'IOError', 'WindowsError', 'BlockingIOError',
    'ChildProcessError', 'ConnectionError', 'BrokenPipeError', 'ConnectionAbortedError',
    'ConnectionRefusedError', 'ConnectionResetError', 'FileExistsError', 'FileNotFoundError',
    'IsADirectoryError', 'NotADirectoryError', 'InterruptedError', 'PermissionError', 'ProcessLookupError',
    'TimeoutError'
]);