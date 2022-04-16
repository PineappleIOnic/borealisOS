module.exports = class BorealisPatch {
    getPatchFiles() {
        throw new Error('Invalid Patch! Does not override getPatchFiles function.')
    }

    patch(file) {
        throw new Error('Invalid Patch! Does not override patch function.')
    }

    hookFunc(source, target, func) {
        let targetStringIndex = source.indexOf(target);

        source = source.slice(0, targetStringIndex + target.length) 
        + func
        + source.slice(targetStringIndex + target.length, source.length);

        return source;
    }
}